import { describe, it, expect, beforeAll } from "@jest/globals";
import { initTRPC, TRPCError } from "@trpc/server";
import { timingSafeEqual } from "node:crypto";

const VALID_TOKEN = "test-service-token-1234567890";

/**
 * Standalone test for the service-token auth middleware logic.
 * We recreate the middleware inline (same algorithm as TrpcBaseService)
 * to avoid pulling in NestJS DI for a unit test.
 */
function buildServiceTokenMiddleware(expectedToken: string) {
  const t = initTRPC.context<{ serviceToken?: string }>().create();

  const enforceServiceToken = t.middleware(async ({ ctx, next }) => {
    const raw = ctx.serviceToken;
    if (!raw) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const expected = Buffer.from(expectedToken);
    const provided = Buffer.from(raw);
    if (
      expected.length !== provided.length ||
      !timingSafeEqual(expected, provided)
    ) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  });

  const router = t.router({
    test: t.procedure.use(enforceServiceToken).query(() => "ok"),
  });

  return { router, createCaller: t.createCallerFactory(router) };
}

describe("serviceProcedure auth", () => {
  let caller: ReturnType<
    ReturnType<typeof buildServiceTokenMiddleware>["createCaller"]
  >;

  describe("missing header", () => {
    beforeAll(() => {
      const { createCaller } = buildServiceTokenMiddleware(VALID_TOKEN);
      caller = createCaller({ serviceToken: undefined });
    });

    it("rejects with UNAUTHORIZED", async () => {
      await expect(caller.test()).rejects.toThrow(
        expect.objectContaining({ code: "UNAUTHORIZED" }),
      );
    });
  });

  describe("wrong token", () => {
    beforeAll(() => {
      const { createCaller } = buildServiceTokenMiddleware(VALID_TOKEN);
      caller = createCaller({ serviceToken: "wrong-token-value" });
    });

    it("rejects with UNAUTHORIZED", async () => {
      await expect(caller.test()).rejects.toThrow(
        expect.objectContaining({ code: "UNAUTHORIZED" }),
      );
    });
  });

  describe("valid token", () => {
    beforeAll(() => {
      const { createCaller } = buildServiceTokenMiddleware(VALID_TOKEN);
      caller = createCaller({ serviceToken: VALID_TOKEN });
    });

    it("allows the request through", async () => {
      const result = await caller.test();
      expect(result).toBe("ok");
    });
  });
});
