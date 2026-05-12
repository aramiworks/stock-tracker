import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import * as Sentry from "@sentry/node";
import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import superjson from "superjson";
import { PrismaService } from "../prisma/prisma.service.js";
import { PinoLoggerService } from "../logger/pino-logger.service.js";
import { getEfcvFromTrpcPath } from "../sentry/efcv-from-trpc-path.js";

export interface TrpcContext {
  prisma: PrismaService;
  userId: string | undefined;
  userRole: string | undefined;
  requestId: string;
}

/**
 * Base tRPC service providing shared context, middleware, and procedure builders.
 * Each service extends this or uses it directly.
 */
@Injectable()
export class TrpcBaseService {
  private readonly t;
  private readonly rawLogger;

  constructor(
    private readonly prisma: PrismaService,
    private readonly loggerService: PinoLoggerService,
  ) {
    this.rawLogger = loggerService.getRawLogger();
    this.t = initTRPC.context<TrpcContext>().create({
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
  }

  createContext = async ({
    req,
  }: CreateExpressContextOptions): Promise<TrpcContext> => {
    // SECURITY: x-user-id and x-user-role are trusted because this service
    // is ONLY reachable through Apollo Router (which validates the JWT and
    // sets these headers). Direct access from outside the internal network
    // must be blocked at the infrastructure level (firewall / Railway private
    // networking). Never expose this port publicly.
    const userId = req.headers["x-user-id"] as string | undefined;
    const userRole = req.headers["x-user-role"] as string | undefined;
    const requestId =
      (req.headers["x-request-id"] as string | undefined) || randomUUID();

    return { prisma: this.prisma, userId, userRole, requestId };
  };

  get router() {
    return this.t.router;
  }

  get middleware() {
    return this.t.middleware;
  }

  get logRequest() {
    const logger = this.rawLogger;
    return this.t.middleware(async ({ ctx, path, type, next }) => {
      const start = performance.now();
      const reqLogger = logger.child({
        requestId: ctx.requestId,
        procedure: path,
      });

      reqLogger.info({ type }, "request started");
      const result = await next();
      const duration = Math.round(performance.now() - start);

      if (result.ok) {
        reqLogger.info(
          { type, duration, userId: ctx.userId },
          "request completed",
        );
      } else {
        reqLogger.error(
          { type, duration, userId: ctx.userId, code: result.error.code },
          "request failed",
        );
      }
      return result;
    });
  }

  get enforceAuth() {
    return this.t.middleware(async ({ ctx, next }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return next({ ctx: { ...ctx, userId: ctx.userId } });
    });
  }

  enforceRole(role: string) {
    return this.t.middleware(async ({ ctx, next }) => {
      if (ctx.userRole !== role) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return next();
    });
  }

  /**
   * Sentry per-procedure scoping: tags the active scope with EFCV derived
   * from the procedure path, plus requestId and userId, and captures any
   * thrown error before re-throwing. No-ops when Sentry isn't initialised.
   */
  get sentryCapture() {
    return this.t.middleware(async ({ ctx, path, next }) => {
      return Sentry.withScope(async (scope) => {
        const { experience, flow, container } = getEfcvFromTrpcPath(path);
        scope.setTags({
          procedure: path,
          ...(experience && { experience }),
          ...(flow && { flow }),
          ...(container && { container }),
          ...(ctx.requestId && { requestId: ctx.requestId }),
        });
        if (ctx.userId) scope.setUser({ id: ctx.userId });
        try {
          return await next();
        } catch (err) {
          Sentry.captureException(err);
          throw err;
        }
      });
    });
  }

  get publicProcedure() {
    return this.t.procedure.use(this.sentryCapture).use(this.logRequest);
  }

  get protectedProcedure() {
    return this.publicProcedure.use(this.enforceAuth);
  }

  get adminProcedure() {
    return this.protectedProcedure.use(this.enforceRole("service_role"));
  }
}
