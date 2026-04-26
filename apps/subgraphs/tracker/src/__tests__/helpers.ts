import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "@stock-tracker/api/trpc";
import { prisma } from "@stock-tracker/prisma/client";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { dirname, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";
import { authTypeDefs } from "../auth/views/auth.views.js";
import { authResolvers } from "../auth/controllers/auth.controllers.js";
import { trackerTypeDefs } from "../tracker/views/tracker.views.js";
import { trackerResolvers } from "../tracker/controllers/tracker.controllers.js";
import {
  createAuthTrpcClient,
  createTrackerTrpcClient,
} from "../clients/trpc.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface TrpcServersHandle {
  authUrl: string;
  trackerUrl: string;
  close: () => Promise<void>;
}

// Inline createContext to avoid cross-package import that breaks tsc
async function createContext({ req }: CreateHTTPContextOptions) {
  const userId = req.headers["x-user-id"] as string | undefined;
  const userRole = req.headers["x-user-role"] as string | undefined;
  const requestId =
    (req.headers["x-request-id"] as string | undefined) || randomUUID();
  return { prisma, userId, userRole, requestId };
}

/**
 * Spawns the tracker-service test server as a child process.
 * Uses the pre-compiled JS (tsc output in dist/) to avoid ts-jest
 * transforming @nestjs/* (too slow) and to support emitDecoratorMetadata
 * (tsx/esbuild doesn't). Reads TRACKER_URL=<url> from stdout when ready.
 */
function spawnTrackerTestServer(): Promise<{
  url: string;
  child: ChildProcess;
}> {
  const cliPath = pathResolve(
    __dirname,
    "../../../../services/tracker/dist/test-server-cli.js",
  );

  return new Promise((resolve, reject) => {
    const child = spawn("node", [cliPath], {
      env: {
        ...process.env,
        // NestJS config validation needs these — the test server doesn't
        // actually use Supabase, but the Zod schema requires them.
        SUPABASE_URL: process.env["SUPABASE_URL"] || "http://localhost:54321",
        SUPABASE_ANON_KEY: process.env["SUPABASE_ANON_KEY"] || "test-anon-key",
        SUPABASE_SERVICE_ROLE_KEY:
          process.env["SUPABASE_SERVICE_ROLE_KEY"] || "test-service-role-key",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let resolved = false;
    let stdout = "";
    child.stdout!.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
      const match = stdout.match(/TRACKER_URL=(.+)/);
      if (match) {
        resolved = true;
        resolve({ url: match[1]!.trim(), child });
      }
    });

    let stderr = "";
    child.stderr!.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (!resolved) {
        reject(
          new Error(
            `tracker test server exited before ready (code=${code}, signal=${signal}): ${stderr}`,
          ),
        );
      }
    });
  });
}

/**
 * Starts two tRPC servers:
 * - Auth server: standalone tRPC HTTP server from apps/api (auth procedures).
 *   apps/api remains the test-only auth backend; the production subgraph
 *   talks to apps/services/auth at /trpc, but the auth procedures are
 *   structurally identical so the typed client works against either.
 * - Tracker server: child process running tracker-service via tsx
 */
export async function startTrpcServers(): Promise<TrpcServersHandle> {
  // Auth server — standalone tRPC HTTP server from apps/api
  const authHandle = await new Promise<{
    url: string;
    close: () => Promise<void>;
  }>((resolve) => {
    const httpServer = createHTTPServer({
      router: appRouter,
      createContext,
    });

    const listener = httpServer.listen(0, () => {
      const address = listener.address();
      const port =
        typeof address === "object" && address !== null ? address.port : 0;
      const url = `http://localhost:${port}`;
      resolve({
        url,
        close: () =>
          new Promise<void>((res, rej) => {
            listener.close((err?: Error) => (err ? rej(err) : res()));
          }),
      });
    });
  });

  // Tracker server — spawned as child process (avoids ts-jest @nestjs transform)
  let trackerHandle: Awaited<ReturnType<typeof spawnTrackerTestServer>>;
  try {
    trackerHandle = await spawnTrackerTestServer();
  } catch (err) {
    await authHandle.close();
    throw err;
  }

  return {
    authUrl: authHandle.url,
    trackerUrl: trackerHandle.url,
    close: async () => {
      await new Promise<void>((res) => {
        if (trackerHandle.child.exitCode !== null) {
          res();
          return;
        }
        trackerHandle.child.once("exit", () => res());
        trackerHandle.child.kill("SIGTERM");
      });
      await authHandle.close();
    },
  };
}

export function createTestApolloServer(): ApolloServer {
  return new ApolloServer({
    schema: buildSubgraphSchema([
      { typeDefs: authTypeDefs, resolvers: authResolvers },
      { typeDefs: trackerTypeDefs, resolvers: trackerResolvers },
    ]),
    formatError: (formattedError, error) => {
      const cause = (error as Record<string, unknown>)?.extensions as
        | Record<string, unknown>
        | undefined;
      const requestId = (cause?.cause as Record<string, unknown>)?.data as
        | Record<string, unknown>
        | undefined;
      return {
        ...formattedError,
        extensions: {
          ...formattedError.extensions,
          ...(requestId?.requestId ? { requestId: requestId.requestId } : {}),
        },
      };
    },
  });
}

interface ExecuteOptions {
  server: ApolloServer;
  query: string;
  variables?: Record<string, unknown>;
  authUrl: string;
  trackerUrl: string;
  userId?: string;
}

/**
 * Execute a GraphQL operation against the test Apollo server with real
 * tRPC clients. The auth client points at the auth server (apps/api)
 * and the tracker client points at the tracker-service.
 */
export async function executeAs({
  server,
  query,
  variables,
  authUrl,
  trackerUrl,
  userId,
}: ExecuteOptions) {
  const headers: Record<string, string | undefined> = {
    "x-user-id": userId,
    "x-user-role": undefined,
    "x-request-id": "test-request-id",
  };

  const prevAuth = process.env["TRPC_AUTH_SERVICE_URL"];
  const prevTracker = process.env["TRPC_TRACKER_SERVICE_URL"];
  process.env["TRPC_AUTH_SERVICE_URL"] = authUrl;
  process.env["TRPC_TRACKER_SERVICE_URL"] = trackerUrl;

  const authTrpc = createAuthTrpcClient(headers);
  const trackerTrpc = createTrackerTrpcClient(headers);

  if (prevAuth !== undefined) {
    process.env["TRPC_AUTH_SERVICE_URL"] = prevAuth;
  } else {
    delete process.env["TRPC_AUTH_SERVICE_URL"];
  }
  if (prevTracker !== undefined) {
    process.env["TRPC_TRACKER_SERVICE_URL"] = prevTracker;
  } else {
    delete process.env["TRPC_TRACKER_SERVICE_URL"];
  }

  const response = await server.executeOperation(
    {
      query,
      variables,
    },
    {
      contextValue: {
        "x-user-id": userId,
        "x-user-role": undefined,
        "x-request-id": "test-request-id",
        userId,
        userRole: undefined,
        authTrpc,
        trackerTrpc,
      },
    },
  );

  return response;
}
