import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { AppModule } from "./app.module.js";
import { TrpcRouter } from "./trpc/trpc.router.js";

/**
 * Starts a tracker-service NestJS app on a random port for e2e testing.
 * Returns the base tRPC URL (with /trpc path) and a close function.
 */
export async function startTrackerTestServer(): Promise<{
  url: string;
  close: () => Promise<void>;
}> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
  });

  const trpcRouter = app.get(TrpcRouter);
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.use(
    "/trpc",
    createExpressMiddleware({
      router: trpcRouter.appRouter,
      createContext: trpcRouter.createContext,
    }),
  );

  await app.listen(0);
  const appUrl = await app.getUrl();

  return {
    url: `${appUrl}/trpc`,
    close: () => app.close(),
  };
}
