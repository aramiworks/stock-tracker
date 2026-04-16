import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { TRPCError } from "@trpc/server";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { z } from "zod";

// Mock prisma before importing trpc module
jest.unstable_mockModule("@stock-tracker/prisma/client", () => ({
  prisma: { auth_users: {} },
}));

const {
  createContext,
  setLogger,
  setJwtVerifier,
  createCallerFactory,
  router,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} = await import("./trpc.js");

// Helper to create a minimal request with headers
function makeReq(
  headers: Record<string, string> = {},
): CreateHTTPContextOptions {
  return {
    req: { headers },
    res: {},
    info: { isBatchCall: false, calls: [] },
  } as unknown as CreateHTTPContextOptions;
}

describe("createContext", () => {
  beforeEach(() => {
    setJwtVerifier(null as any);
  });

  it("extracts userId and requestId from headers", async () => {
    const ctx = await createContext(
      makeReq({
        "x-user-id": "user-123",
        "x-user-role": "authenticated",
        "x-request-id": "req-456",
      }),
    );

    expect(ctx.userId).toBe("user-123");
    expect(ctx.userRole).toBe("authenticated");
    expect(ctx.requestId).toBe("req-456");
    expect(ctx.prisma).toBeDefined();
  });

  it("generates a requestId when header is missing", async () => {
    const ctx = await createContext(makeReq({ "x-user-id": "user-123" }));
    expect(ctx.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("falls back to JWT when no x-user-id and verifier is set", async () => {
    setJwtVerifier(async () => ({ sub: "jwt-user", role: "authenticated" }));

    const ctx = await createContext(
      makeReq({ authorization: "Bearer some-token" }),
    );

    expect(ctx.userId).toBe("jwt-user");
  });

  it("does not call JWT verifier when x-user-id is present", async () => {
    const verifier = jest.fn<() => Promise<{ sub: string } | null>>();
    setJwtVerifier(verifier as any);

    const ctx = await createContext(makeReq({ "x-user-id": "user-123" }));

    expect(ctx.userId).toBe("user-123");
    expect(verifier).not.toHaveBeenCalled();
  });

  it("returns undefined userId when JWT verification returns null", async () => {
    setJwtVerifier(async () => null);

    const ctx = await createContext(
      makeReq({ authorization: "Bearer bad-token" }),
    );

    expect(ctx.userId).toBeUndefined();
  });

  it("returns undefined userId when no auth header and verifier set", async () => {
    setJwtVerifier(async () => ({ sub: "user" }));

    const ctx = await createContext(makeReq({}));

    expect(ctx.userId).toBeUndefined();
  });

  it("returns undefined userId when auth header is not Bearer", async () => {
    setJwtVerifier(async () => ({ sub: "user" }));

    const ctx = await createContext(makeReq({ authorization: "Basic abc" }));

    expect(ctx.userId).toBeUndefined();
  });
});

describe("setLogger", () => {
  it("accepts a logger object", () => {
    const mockLogger = {
      child: jest.fn().mockReturnThis() as any,
      info: jest.fn() as any,
      error: jest.fn() as any,
    };
    expect(() => setLogger(mockLogger)).not.toThrow();
  });
});

// Create a test router to exercise middleware
const testRouter = router({
  publicGreet: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => `Hello ${input.name}`),

  protectedGreet: protectedProcedure.query(({ ctx }) => `Hi ${ctx.userId}`),

  adminOnly: adminProcedure.query(() => "admin-data"),

  failingProcedure: publicProcedure.query(() => {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "boom" });
  }),
});

const createCaller = createCallerFactory(testRouter);

describe("middleware: enforceAuth", () => {
  it("throws UNAUTHORIZED when userId is missing", async () => {
    const caller = createCaller({
      prisma: {} as any,
      userId: undefined,
      userRole: undefined,
      requestId: "req-1",
    });

    await expect(caller.protectedGreet()).rejects.toThrow(
      expect.objectContaining({ code: "UNAUTHORIZED" }),
    );
  });

  it("passes when userId is present", async () => {
    const caller = createCaller({
      prisma: {} as any,
      userId: "user-123",
      userRole: undefined,
      requestId: "req-1",
    });

    const result = await caller.protectedGreet();
    expect(result).toBe("Hi user-123");
  });
});

describe("middleware: enforceRole", () => {
  it("throws FORBIDDEN when role does not match", async () => {
    const caller = createCaller({
      prisma: {} as any,
      userId: "user-123",
      userRole: "authenticated",
      requestId: "req-1",
    });

    await expect(caller.adminOnly()).rejects.toThrow(
      expect.objectContaining({ code: "FORBIDDEN" }),
    );
  });

  it("passes when role matches service_role", async () => {
    const caller = createCaller({
      prisma: {} as any,
      userId: "user-123",
      userRole: "service_role",
      requestId: "req-1",
    });

    const result = await caller.adminOnly();
    expect(result).toBe("admin-data");
  });
});

describe("middleware: logRequest", () => {
  it("logs start and completion for successful requests", async () => {
    const info = jest.fn() as any;
    const error = jest.fn() as any;
    const childLogger = { info, error, child: jest.fn() as any };
    const mockLogger = {
      child: jest.fn().mockReturnValue(childLogger) as any,
      info: jest.fn() as any,
      error: jest.fn() as any,
    };
    setLogger(mockLogger);

    const caller = createCaller({
      prisma: {} as any,
      userId: "user-123",
      userRole: undefined,
      requestId: "req-1",
    });

    await caller.publicGreet({ name: "World" });

    expect(mockLogger.child).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: "req-1", procedure: "publicGreet" }),
    );
    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({ type: "query" }),
      "request started",
    );
    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({ type: "query", duration: expect.any(Number) }),
      "request completed",
    );
    expect(error).not.toHaveBeenCalled();
  });

  it("logs error for failed requests", async () => {
    const info = jest.fn() as any;
    const error = jest.fn() as any;
    const childLogger = { info, error, child: jest.fn() as any };
    const mockLogger = {
      child: jest.fn().mockReturnValue(childLogger) as any,
      info: jest.fn() as any,
      error: jest.fn() as any,
    };
    setLogger(mockLogger);

    const caller = createCaller({
      prisma: {} as any,
      userId: undefined,
      userRole: undefined,
      requestId: "req-2",
    });

    await expect(caller.failingProcedure()).rejects.toThrow();

    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "query",
        duration: expect.any(Number),
        code: "INTERNAL_SERVER_ERROR",
      }),
      "request failed",
    );
  });
});

// Note: error formatter (adds requestId to shape) only runs during HTTP
// serialization, not via callers. Covered by e2e tests (requestId.e2e.test.ts).
