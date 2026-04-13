import { randomUUID } from "node:crypto";
import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import superjson from "superjson";
import { prisma } from "@stock-tracker/prisma/client";

interface MinimalLogger {
  child(bindings: Record<string, unknown>): MinimalLogger;
  info(obj: Record<string, unknown>, msg: string): void;
  error(obj: Record<string, unknown>, msg: string): void;
}

const noop = () => {};
const noopLogger: MinimalLogger = {
  child: () => noopLogger,
  info: noop,
  error: noop,
};

let _logger: MinimalLogger = noopLogger;

export function setLogger(l: MinimalLogger) {
  _logger = l;
}

let _verifyJwt:
  | ((token: string) => Promise<{ sub: string; role?: string } | null>)
  | null = null;

export function setJwtVerifier(
  fn: (token: string) => Promise<{ sub: string; role?: string } | null>,
) {
  _verifyJwt = fn;
}

export const createContext = async ({ req }: CreateHTTPContextOptions) => {
  let userId = req.headers["x-user-id"] as string | undefined;
  const userRole = req.headers["x-user-role"] as string | undefined;
  const requestId =
    (req.headers["x-request-id"] as string | undefined) || randomUUID();

  // Defense-in-depth: if no x-user-id (direct tRPC access bypassing router),
  // attempt JWT verification from Authorization header
  if (!userId && _verifyJwt) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const claims = await _verifyJwt(token);
      if (claims) {
        userId = claims.sub;
      }
    }
  }

  return { prisma, userId, userRole, requestId };
};

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, ctx }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        requestId: ctx?.requestId ?? randomUUID(),
      },
    };
  },
});

const logRequest = t.middleware(async ({ ctx, path, type, next }) => {
  const start = performance.now();
  const reqLogger = _logger.child({
    requestId: ctx.requestId,
    procedure: path,
  });

  reqLogger.info({ type }, "request started");

  const result = await next();

  const duration = Math.round(performance.now() - start);

  if (result.ok) {
    reqLogger.info({ type, duration, userId: ctx.userId }, "request completed");
  } else {
    reqLogger.error(
      { type, duration, userId: ctx.userId, code: result.error.code },
      "request failed",
    );
  }

  return result;
});

const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

const enforceRole = (role: string) =>
  t.middleware(async ({ ctx, next }) => {
    if (ctx.userRole !== role) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next();
  });

const baseProcedure = t.procedure.use(logRequest);

export const router = t.router;
export const publicProcedure = baseProcedure;
export const protectedProcedure = baseProcedure.use(enforceAuth);
export const adminProcedure = protectedProcedure.use(
  enforceRole("service_role"),
);
export const middleware = t.middleware;
