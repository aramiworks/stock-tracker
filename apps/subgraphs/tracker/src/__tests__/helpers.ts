import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "@stock-tracker/api/trpc";
import { prisma } from "@stock-tracker/prisma/client";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { randomUUID } from "node:crypto";
import { authTypeDefs } from "../auth/views/auth.views.js";
import { authResolvers } from "../auth/controllers/auth.controllers.js";
import { trackerTypeDefs } from "../tracker/views/tracker.views.js";
import { trackerResolvers } from "../tracker/controllers/tracker.controllers.js";
import { createTrpcClient } from "../clients/trpc.js";

interface TrpcServerHandle {
  url: string;
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

export async function startTrpcServer(): Promise<TrpcServerHandle> {
  return new Promise((resolve) => {
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
  trpcUrl: string;
  userId?: string;
}

/**
 * Execute a GraphQL operation against the test Apollo server with a real
 * tRPC client pointing at the running tRPC server.
 */
export async function executeAs({
  server,
  query,
  variables,
  trpcUrl,
  userId,
}: ExecuteOptions) {
  const headers: Record<string, string | undefined> = {
    "x-user-id": userId,
    "x-user-role": undefined,
    "x-request-id": "test-request-id",
  };

  // Set the env so createTrpcClient picks up the test server URL
  const prev = process.env["TRPC_SERVICE_URL"];
  process.env["TRPC_SERVICE_URL"] = trpcUrl;
  const trpc = createTrpcClient(headers);
  process.env["TRPC_SERVICE_URL"] = prev;

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
        trpc,
      },
    },
  );

  return response;
}
