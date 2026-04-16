import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { authTypeDefs } from "./auth/views/auth.views.js";
import { authResolvers } from "./auth/controllers/auth.controllers.js";
import { trackerTypeDefs } from "./tracker/views/tracker.views.js";
import { trackerResolvers } from "./tracker/controllers/tracker.controllers.js";
import { createTrpcClient } from "./clients/trpc.js";
import { logger, loggingPlugin } from "./middleware/logging.js";

const server = new ApolloServer({
  schema: buildSubgraphSchema([
    { typeDefs: authTypeDefs, resolvers: authResolvers },
    { typeDefs: trackerTypeDefs, resolvers: trackerResolvers },
  ]),
  plugins: [loggingPlugin],
  formatError: (formattedError, error) => {
    const cause = (error as any)?.extensions?.cause;
    const requestId = cause?.data?.requestId;
    return {
      ...formattedError,
      extensions: {
        ...formattedError.extensions,
        ...(requestId ? { requestId } : {}),
      },
    };
  },
});

const { url } = await startStandaloneServer(server, {
  listen: { port: Number(process.env["PORT"]) || 4001 },
  context: async ({ req }) => {
    const headers = {
      "x-user-id": req.headers["x-user-id"] as string | undefined,
      "x-user-role": req.headers["x-user-role"] as string | undefined,
      "x-request-id": req.headers["x-request-id"] as string | undefined,
      authorization: req.headers["authorization"] as string | undefined,
    };
    return {
      ...headers,
      userId: headers["x-user-id"],
      userRole: headers["x-user-role"],
      trpc: createTrpcClient(headers),
    };
  },
});

logger.info({ url }, "subgraph tracker ready");
