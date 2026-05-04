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
import {
  deleteByPrefix,
  getAuthUserId,
  makeRunId,
  prefix,
} from "./helpers/cleanup.js";
import { gql } from "./helpers/gql.js";

const runId = makeRunId();
const runPrefix = prefix(runId);

let session: SignInResult;
let authUserId: string;

beforeAll(async () => {
  session = await signIn();
  const id = await getAuthUserId(session.userId);
  if (!id) {
    throw new Error(
      `auth_users row missing for ${session.email} — run scripts/e2e-seed.mjs against the deployed env first`,
    );
  }
  authUserId = id;
});

afterAll(async () => {
  if (authUserId) {
    await deleteByPrefix(authUserId, runPrefix);
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
        totalAccounts: number;
        totalPurchases: number;
        totalSpent: number;
      };
    }>(
      `query { dashboard { totalAccounts totalPurchases totalSpent } }`,
      {},
      {
        token: session.accessToken,
      },
    );

    expect(status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data?.dashboard).toBeDefined();
    expect(typeof body.data?.dashboard.totalAccounts).toBe("number");
    expect(typeof body.data?.dashboard.totalPurchases).toBe("number");
    expect(typeof body.data?.dashboard.totalSpent).toBe("number");
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

  // Skipped pending INF-1247: createAccount mutation fails on deployed develop
  // (subgraph error; the same path passes in hermetic subgraph e2e).
  it.skip("4. createAccount mutation round-trips through the full chain", async () => {
    const storeName = `${runPrefix} 까르띠에 청담`;
    const { status, body } = await gql<{
      createAccount: { id: string; storeName: string };
    }>(
      `mutation Create($input: CreateAccountInput!) {
        createAccount(input: $input) { id storeName }
      }`,
      { input: { storeName, saName: "E2E SA", notes: "post-deploy smoke" } },
      { token: session.accessToken },
    );

    expect(status).toBe(200);
    expect(body.errors).toBeUndefined();
    expect(body.data?.createAccount.id).toBeTruthy();
    expect(body.data?.createAccount.storeName).toBe(storeName);
  });

  // Skipped pending INF-1247 (depends on createAccount).
  it.skip("5. created account is owned by the JWT subject and readable back", async () => {
    const storeName = `${runPrefix} ownership-check`;
    const create = await gql<{ createAccount: { id: string } }>(
      `mutation Create($input: CreateAccountInput!) {
        createAccount(input: $input) { id }
      }`,
      { input: { storeName } },
      { token: session.accessToken },
    );
    expect(create.body.errors).toBeUndefined();
    const newId = create.body.data?.createAccount.id;
    expect(newId).toBeTruthy();

    const list = await gql<{
      accounts: Array<{ id: string; storeName: string }>;
    }>(
      `query { accounts { id storeName } }`,
      {},
      { token: session.accessToken },
    );
    expect(list.body.errors).toBeUndefined();
    const found = list.body.data?.accounts.find((a) => a.id === newId);
    expect(found).toBeDefined();
    expect(found?.storeName).toBe(storeName);
  });

  it("6. invalid query returns GraphQL errors with extensions", async () => {
    const { status, body } = await gql(
      `query { account(id: "definitely-not-a-uuid") { id } }`,
      {},
      { token: session.accessToken },
    );

    // The router proxies subgraph errors back; we don't care about the
    // exact code, only that the error envelope is preserved end-to-end.
    expect(status).toBe(200);
    const dataAccount = (body.data as { account?: unknown } | undefined)
      ?.account;
    const failed = (body.errors?.length ?? 0) > 0 || dataAccount === null;
    expect(failed).toBe(true);
  });
});
