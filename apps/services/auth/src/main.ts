import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { AppModule } from "./app.module.js";
import { TrpcRouter } from "./trpc/trpc.router.js";
import { PinoLoggerService } from "@stock-tracker/nestjs-common";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const logger = app.get(PinoLoggerService);
  app.useLogger(logger);

  const trpcRouter = app.get(TrpcRouter);
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.use(
    "/trpc",
    createExpressMiddleware({
      router: trpcRouter.appRouter,
      createContext: trpcRouter.createContext,
    }),
  );

  const port = process.env["PORT"] ?? 4010;
  await app.listen(port);
  logger.log(`auth-service listening on port ${port}`);
}

bootstrap();
