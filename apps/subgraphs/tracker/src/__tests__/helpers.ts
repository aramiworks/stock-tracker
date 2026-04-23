import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "@stock-tracker/api/trpc";
import { startTrackerTestServer } from "@stock-tracker/tracker-service/test-server";
import { prisma } from "@stock-tracker/prisma/client";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { randomUUID } from "node:crypto";
import { authTypeDefs } from "../auth/views/auth.views.js";
import { authResolvers } from "../auth/controllers/auth.controllers.js";
import { trackerTypeDefs } from "../tracker/views/tracker.views.js";
import { trackerResolvers } from "../tracker/controllers/tracker.controllers.js";
import {
  createApiTrpcClient,
  createTrackerTrpcClient,
} from "../clients/trpc.js";

interface TrpcServersHandle {
  apiUrl: string;
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
 * Starts two tRPC servers:
 * - Auth server: standalone tRPC HTTP server from apps/api (auth procedures)
 * - Tracker server: NestJS app from tracker-service (tracker procedures)
 */
export async function startTrpcServers(): Promise<TrpcServersHandle> {
  // Auth server — standalone tRPC HTTP server from apps/api
  const apiHandle = await new Promise<{
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

  // Tracker server — NestJS app from tracker-service
  const trackerHandle = await startTrackerTestServer();

  return {
    apiUrl: apiHandle.url,
    trackerUrl: trackerHandle.url,
    close: async () => {
      await Promise.all([apiHandle.close(), trackerHandle.close()]);
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
  apiUrl: string;
  trackerUrl: string;
  userId?: string;
}

/**
 * Execute a GraphQL operation against the test Apollo server with real
 * tRPC clients. The API client points at the auth server (apps/api)
 * and the tracker client points at the tracker-service.
 */
export async function executeAs({
  server,
  query,
  variables,
  apiUrl,
  trackerUrl,
  userId,
}: ExecuteOptions) {
  const headers: Record<string, string | undefined> = {
    "x-user-id": userId,
    "x-user-role": undefined,
    "x-request-id": "test-request-id",
  };

  const prevApi = process.env["TRPC_API_URL"];
  const prevTracker = process.env["TRPC_TRACKER_SERVICE_URL"];
  process.env["TRPC_API_URL"] = apiUrl;
  process.env["TRPC_TRACKER_SERVICE_URL"] = trackerUrl;

  const apiTrpc = createApiTrpcClient(headers);
  const trackerTrpc = createTrackerTrpcClient(headers);

  if (prevApi !== undefined) {
    process.env["TRPC_API_URL"] = prevApi;
  } else {
    delete process.env["TRPC_API_URL"];
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
        apiTrpc,
        trackerTrpc,
      },
    },
  );

  return response;
}
