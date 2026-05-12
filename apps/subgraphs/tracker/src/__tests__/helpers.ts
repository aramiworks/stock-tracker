import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";
import { dirname, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";
import { trackerTypeDefs } from "../tracker/views/tracker.views.js";
import { trackerResolvers } from "../tracker/controllers/tracker.controllers.js";
import { createTrackerTrpcClient } from "../clients/trpc.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface TrpcServersHandle {
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
 * Starts the tracker-service NestJS tRPC server as a child process and returns
 * its URL. Subgraph tests use this to wire a real tracker tRPC client into the
 * test Apollo server without needing the auth subgraph or its service.
 */
export async function startTrpcServers(): Promise<TrpcServersHandle> {
  const trackerCliPath = pathResolve(
    __dirname,
    "../../../../services/tracker/dist/test-server-cli.js",
  );

  const trackerHandle = await spawnNestTestServer(
    trackerCliPath,
    "TRACKER_URL",
  );

  return {
    trackerUrl: trackerHandle.url,
    close: async () => {
      await killChild(trackerHandle.child);
    },
  };
}

export function createTestApolloServer(): ApolloServer {
  return new ApolloServer({
    schema: buildSubgraphSchema([
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
  trackerUrl: string;
  userId?: string;
}

/**
 * Execute a GraphQL operation against the test Apollo server with a real
 * tracker tRPC client pointing at the spawned tracker-service test server.
 */
export async function executeAs({
  server,
  query,
  variables,
  trackerUrl,
  userId,
}: ExecuteOptions) {
  const headers: Record<string, string | undefined> = {
    "x-user-id": userId,
    "x-user-role": undefined,
    "x-request-id": "test-request-id",
  };

  const prevTracker = process.env["TRPC_TRACKER_SERVICE_URL"];
  process.env["TRPC_TRACKER_SERVICE_URL"] = trackerUrl;

  const trackerTrpc = createTrackerTrpcClient(headers);

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
        trackerTrpc,
      },
    },
  );

  return response;
}
