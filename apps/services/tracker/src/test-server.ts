import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { AppModule } from "./app.module.js";
import { TrpcRouter } from "./trpc/trpc.router.js";

// Set placeholder env vars for NestJS config validation in test.
// The test server doesn't use Supabase — only the schema validation needs them.
const testDefaults: Record<string, string> = {
  SUPABASE_URL: "http://localhost:54321",
  SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
};
for (const [key, value] of Object.entries(testDefaults)) {
  if (!process.env[key]) process.env[key] = value;
}

/**
 * Starts a tracker-service tRPC server on a random port for e2e testing.
 * Uses NestJS application context (no HTTP server) to resolve DI, then
 * creates a standalone tRPC HTTP server — avoids Express hanging issues.
 */
export async function startTrackerTestServer(): Promise<{
  url: string;
  close: () => Promise<void>;
}> {
  // Create DI context without starting an HTTP server.
  // abortOnError: false makes NestJS throw instead of process.exit(1).
  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error"],
    abortOnError: false,
  });

  const trpcRouter = appContext.get(TrpcRouter);

  // Use standalone tRPC HTTP server (same pattern as apps/api tests)
  return new Promise((resolve) => {
    const httpServer = createHTTPServer({
      router: trpcRouter.appRouter,
      // Cast: standalone adapter uses IncomingMessage, NestJS context uses
      // Express Request — both expose req.headers identically at runtime.
      createContext: trpcRouter.createContext as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    });

    const listener = httpServer.listen(0, () => {
      const address = listener.address();
      const port =
        typeof address === "object" && address !== null ? address.port : 0;
      const url = `http://localhost:${port}`;
      resolve({
        url,
        close: async () => {
          await new Promise<void>((res, rej) => {
            listener.close((err?: Error) => (err ? rej(err) : res()));
          });
          await appContext.close();
        },
      });
    });
  });
}
