import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import { signTestJwt } from "./helpers/jwt.js";
import { startStack, type StackHandle } from "./helpers/stack.js";
import { generateKeyPair } from "jose";

let stack: StackHandle;

beforeAll(async () => {
  stack = await startStack();
}, 60_000);

afterAll(async () => {
  await stack?.stop();
});

beforeEach(() => {
  stack.subgraph.reset();
});

const TEST_USER_ID = "11111111-1111-1111-1111-111111111111";

async function gql(
  query: string,
  options: { authorization?: string; requestId?: string } = {},
): Promise<{ status: number; body: GqlResponse }> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (options.authorization) headers["authorization"] = options.authorization;
  if (options.requestId) headers["x-request-id"] = options.requestId;

  const res = await fetch(stack.routerUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });
  const body = (await res.json()) as GqlResponse;
  return { status: res.status, body };
}

interface GqlResponse {
  data?: { testHeaders?: TestHeaders; testEcho?: string };
  errors?: { message: string; extensions?: { code?: string } }[];
}

interface TestHeaders {
  xUserId: string | null;
  xUserRole: string | null;
  xRequestId: string | null;
  authorization: string | null;
}

describe("Apollo Router integration", () => {
  describe("JWKS / JWT validation", () => {
    it("passes unauthenticated requests through without x-user-id", async () => {
      // The router's authentication.router.jwt plugin validates JWTs when
      // present but does not require one. This matches production behavior:
      // unauthenticated requests reach the subgraph without x-user-id, and
      // downstream services (subgraph/tRPC) enforce auth via that header.
      // Regression check: if auth enforcement is ever added at the router,
      // this test will need to be reworked alongside that change.
      const { status, body } = await gql(`{ testHeaders { xUserId } }`);
      expect(status).toBe(200);
      expect(body.errors).toBeUndefined();
      expect(body.data?.testHeaders?.xUserId).toBeNull();
      expect(stack.subgraph.history).toHaveLength(1);
      expect(stack.subgraph.history[0]?.["x-user-id"]).toBeUndefined();
    });

    it("rejects JWTs signed by an untrusted key", async () => {
      const stranger = await generateKeyPair("RS256");
      const badJwt = await signTestJwt({
        privateKey: stranger.privateKey,
        kid: "stranger-key",
        sub: TEST_USER_ID,
      });
      const { status, body } = await gql(`{ testHeaders { xUserId } }`, {
        authorization: `Bearer ${badJwt}`,
      });
      expect(status).toBeGreaterThanOrEqual(400);
      expect(body.errors).toBeDefined();
      expect(stack.subgraph.history).toHaveLength(0);
    });
  });

  describe("Rhai header mapping", () => {
    it("maps JWT 'sub' claim to x-user-id on the subgraph request", async () => {
      const jwt = await signTestJwt({
        privateKey: stack.jwks.privateKey,
        kid: stack.jwks.kid,
        sub: TEST_USER_ID,
      });
      const { status, body } = await gql(
        `{ testHeaders { xUserId xUserRole } }`,
        { authorization: `Bearer ${jwt}` },
      );
      expect(status).toBe(200);
      expect(body.errors).toBeUndefined();
      expect(body.data?.testHeaders?.xUserId).toBe(TEST_USER_ID);
    });

    it("maps JWT 'role' claim to x-user-role on the subgraph request", async () => {
      const jwt = await signTestJwt({
        privateKey: stack.jwks.privateKey,
        kid: stack.jwks.kid,
        sub: TEST_USER_ID,
        role: "admin",
      });
      const { status, body } = await gql(`{ testHeaders { xUserRole } }`, {
        authorization: `Bearer ${jwt}`,
      });
      expect(status).toBe(200);
      expect(body.data?.testHeaders?.xUserRole).toBe("admin");
    });

    it("omits x-user-role when JWT has no 'role' claim", async () => {
      const jwt = await signTestJwt({
        privateKey: stack.jwks.privateKey,
        kid: stack.jwks.kid,
        sub: TEST_USER_ID,
      });
      const { body } = await gql(`{ testHeaders { xUserRole } }`, {
        authorization: `Bearer ${jwt}`,
      });
      expect(body.data?.testHeaders?.xUserRole).toBeNull();
    });
  });

  describe("Header propagation", () => {
    it("propagates x-request-id from client to subgraph", async () => {
      const jwt = await signTestJwt({
        privateKey: stack.jwks.privateKey,
        kid: stack.jwks.kid,
        sub: TEST_USER_ID,
      });
      const { body } = await gql(`{ testHeaders { xRequestId } }`, {
        authorization: `Bearer ${jwt}`,
        requestId: "rid-test-123",
      });
      expect(body.data?.testHeaders?.xRequestId).toBe("rid-test-123");
    });
  });

  describe("Federation routing", () => {
    it("composes the supergraph and routes a query to the subgraph", async () => {
      const jwt = await signTestJwt({
        privateKey: stack.jwks.privateKey,
        kid: stack.jwks.kid,
        sub: TEST_USER_ID,
      });
      const { status, body } = await gql(
        `{ testEcho(input: "hello-router") }`,
        { authorization: `Bearer ${jwt}` },
      );
      expect(status).toBe(200);
      expect(body.errors).toBeUndefined();
      expect(body.data?.testEcho).toBe("hello-router");
      expect(stack.subgraph.history).toHaveLength(1);
    });
  });
});
