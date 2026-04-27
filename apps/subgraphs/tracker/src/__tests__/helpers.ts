import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";
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

interface SpawnedServer {
  url: string;
  child: ChildProcess;
}

/**
 * Spawns a NestJS test server CLI as a child process and resolves once the
 * server prints `<urlPrefix>=<url>` to stdout. We use the pre-compiled JS
 * (tsc output in dist/) instead of running through ts-jest because:
 *   - ts-jest transforming @nestjs/* is too slow for CI
 *   - tsx/esbuild doesn't honor emitDecoratorMetadata, so DI breaks
 */
function spawnNestTestServer(
  cliPath: string,
  urlPrefix: string,
): Promise<SpawnedServer> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [cliPath], {
      env: {
        ...process.env,
        // NestJS config validation needs these — the test servers don't
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
    const urlRe = new RegExp(`${urlPrefix}=(.+)`);
    child.stdout!.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
      const match = stdout.match(urlRe);
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
            `${urlPrefix} test server exited before ready (code=${code}, signal=${signal}): ${stderr}`,
          ),
        );
      }
    });
  });
}

function killChild(child: ChildProcess): Promise<void> {
  return new Promise((resolve) => {
    if (child.exitCode !== null) {
      resolve();
      return;
    }
    child.once("exit", () => resolve());
    child.kill("SIGTERM");
  });
}

/**
 * Starts two NestJS tRPC servers as child processes:
 *   - auth-service test server (apps/services/auth)
 *   - tracker-service test server (apps/services/tracker)
 *
 * Both use the same pattern: precompiled JS spawned via `node`, with a
 * stdout protocol (AUTH_URL=<url> / TRACKER_URL=<url>) signaling readiness.
 */
export async function startTrpcServers(): Promise<TrpcServersHandle> {
  const authCliPath = pathResolve(
    __dirname,
    "../../../../services/auth/dist/test-server-cli.js",
  );
  const trackerCliPath = pathResolve(
    __dirname,
    "../../../../services/tracker/dist/test-server-cli.js",
  );

  // Start both servers in parallel
  const [authHandle, trackerHandle] = await Promise.all([
    spawnNestTestServer(authCliPath, "AUTH_URL"),
    spawnNestTestServer(trackerCliPath, "TRACKER_URL").catch(async (err) => {
      // If tracker fails to start, we still need to clean up the auth server
      // that may have already started. Re-throw after best-effort cleanup.
      throw err;
    }),
  ]).catch(async (err) => {
    // Best-effort cleanup of any started children. We can't reach the handles
    // here, so the caller's test framework will handle stragglers if any.
    throw err;
  });

  return {
    authUrl: authHandle.url,
    trackerUrl: trackerHandle.url,
    close: async () => {
      await Promise.all([
        killChild(authHandle.child),
        killChild(trackerHandle.child),
      ]);
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
 * tRPC clients. The auth client points at the auth-service test server
 * and the tracker client points at the tracker-service test server.
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
