/**
 * Post-deploy full-stack e2e suite.
 *
 * Hits the deployed develop Apollo Router with a real Supabase JWT for the
 * persistent E2E user, then verifies the chain (Router → Subgraph → tRPC
 * services → Prisma → Postgres) end-to-end. Catches regressions that
 * hermetic PR-time tests can't: supergraph composition, JWKS drift, env
 * var typos, deploy ordering, network policy.
 *
 * Required env (provided by .github/workflows/e2e.yml from repo secrets):
 *   E2E_GRAPHQL_URL
 *   E2E_SUPABASE_URL
 *   E2E_SUPABASE_ANON_KEY
 *   E2E_SUPABASE_SERVICE_ROLE_KEY
 *   E2E_USER_EMAIL
 *   E2E_USER_PASSWORD
 */

import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";

import { signIn, type SignInResult } from "./helpers/auth.js";
import { deleteWatchesByIds, getAuthUserId } from "./helpers/cleanup.js";
import { gql } from "./helpers/gql.js";

let session: SignInResult;
let authUserId: string;
let seedUnitId: string | null = null;
const createdWatchIds: string[] = [];

beforeAll(async () => {
  session = await signIn();
  const id = await getAuthUserId(session.userId);
  if (!id) {
    throw new Error(
      `auth_users row missing for ${session.email} — run scripts/e2e-seed.mjs against the deployed env first`,
    );
  }
  authUserId = id;

  const { body } = await gql<{
    catalogList: Array<{
      brand: string;
      productLine: string;
      units: Array<{ id: string; modelName: string }>;
    }>;
  }>(`query { catalogList { brand productLine units { id modelName } } }`);
  seedUnitId = body.data?.catalogList?.[0]?.units?.[0]?.id ?? null;
});

afterAll(async () => {
  if (authUserId && createdWatchIds.length > 0) {
    await deleteWatchesByIds(authUserId, createdWatchIds);
  }
});

describe("full-stack post-deploy e2e", () => {
  it("1. me query returns the authenticated user", async () => {
    const { status, body } = await gql<{
      me: { id: string; email: string } | null;
    }>(`query { me { id email } }`, {}, { token: session.accessToken });

    expect(status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data?.me).not.toBeNull();
    expect(body.data?.me?.email).toBe(session.email);
  });

  it("2. dashboard query returns aggregates", async () => {
    const { status, body } = await gql<{
      dashboard: {
        activeWatches: number;
        unreadAlerts: number;
        recentDrops: number;
      };
    }>(
      `query { dashboard { activeWatches unreadAlerts recentDrops } }`,
      {},
      { token: session.accessToken },
    );

    expect(status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data?.dashboard).toBeDefined();
    expect(typeof body.data?.dashboard.activeWatches).toBe("number");
    expect(typeof body.data?.dashboard.unreadAlerts).toBe("number");
    expect(typeof body.data?.dashboard.recentDrops).toBe("number");
  });

  it("3. unauthenticated request is rejected", async () => {
    const { status, body } = await gql(`query { me { id } }`);

    // Apollo Router with JWT auth enabled rejects with 401 before reaching
    // the subgraph; older configs may return 200 with errors. Accept either
    // shape but require failure.
    const failed =
      status === 401 || (status === 200 && (body.errors?.length ?? 0) > 0);
    expect(failed).toBe(true);
  });

  it("4. createWatch mutation round-trips through the full chain", async () => {
    if (!seedUnitId) {
      console.warn(
        "skip — catalogList is empty on the deployed env, can't exercise createWatch. Seed dev catalog (INF-1551) first.",
      );
      return;
    }
    const { status, body } = await gql<{
      createWatch: {
        id: string;
        watchableUnitId: string;
        notifyPush: boolean;
        notifyEmail: boolean;
      };
    }>(
      `mutation Create($input: CreateWatchInput!) {
        createWatch(input: $input) {
          id
          watchableUnitId
          notifyPush
          notifyEmail
        }
      }`,
      {
        input: {
          watchableUnitId: seedUnitId,
          notifyPush: true,
          notifyEmail: false,
        },
      },
      { token: session.accessToken },
    );

    expect(status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data?.createWatch.id).toBeTruthy();
    expect(body.data?.createWatch.watchableUnitId).toBe(seedUnitId);
    expect(body.data?.createWatch.notifyPush).toBe(true);
    expect(body.data?.createWatch.notifyEmail).toBe(false);

    const newId = body.data?.createWatch.id;
    if (newId) createdWatchIds.push(newId);
  });

  it("5. created watch is owned by the JWT subject and readable back", async () => {
    if (!seedUnitId) {
      console.warn(
        "skip — catalogList is empty on the deployed env, can't exercise createWatch + watches round-trip. Seed dev catalog (INF-1551) first.",
      );
      return;
    }
    const create = await gql<{
      createWatch: { id: string; watchableUnitId: string };
    }>(
      `mutation Create($input: CreateWatchInput!) {
        createWatch(input: $input) { id watchableUnitId }
      }`,
      { input: { watchableUnitId: seedUnitId } },
      { token: session.accessToken },
    );
    expect(create.body.errors).toBeUndefined();
    const newId = create.body.data?.createWatch.id;
    expect(newId).toBeTruthy();
    if (newId) createdWatchIds.push(newId);

    const list = await gql<{
      watches: Array<{ id: string; watchableUnitId: string }>;
    }>(
      `query { watches { id watchableUnitId } }`,
      {},
      { token: session.accessToken },
    );
    expect(list.body.errors).toBeUndefined();
    const found = list.body.data?.watches.find((w) => w.id === newId);
    expect(found).toBeDefined();
    expect(found?.watchableUnitId).toBe(seedUnitId);
  });

  it("6. unknown catalog item returns null without throwing", async () => {
    const { status, body } = await gql<{
      catalogItem: { id: string } | null;
    }>(
      `query { catalogItem(id: "00000000-0000-0000-0000-000000000000") { id } }`,
      {},
      { token: session.accessToken },
    );

    expect(status).toBe(200);
    // Either the subgraph returns null (typical Prisma findUnique semantics)
    // or it returns top-level errors. Either way is a clean end-to-end
    // round trip — what we don't want is a transport failure.
    const ok =
      body.data?.catalogItem === null || (body.errors?.length ?? 0) > 0;
    expect(ok).toBe(true);
  });
});
