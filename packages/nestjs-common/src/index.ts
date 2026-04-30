// Prisma
export { PrismaModule } from "./prisma/prisma.module.js";
export { PrismaService } from "./prisma/prisma.service.js";

// Config
export { AppConfigModule } from "./config/config.module.js";
export { baseEnvSchema, type BaseEnv } from "./config/env.schema.js";

// Logger
export { LoggerModule } from "./logger/logger.module.js";
export { PinoLoggerService } from "./logger/pino-logger.service.js";

// Health
export { HealthModule } from "./health/health.module.js";
export { HealthController } from "./health/health.controller.js";

// tRPC
export { TrpcBaseService, type TrpcContext } from "./trpc/trpc-base.service.js";

// Sentry
export {
  initSentry,
  type InitSentryOptions,
  getEfcvFromTrpcPath,
  type EfcvTags,
} from "./sentry/index.js";
