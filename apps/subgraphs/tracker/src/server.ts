import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { trackerTypeDefs } from "./tracker/views/tracker.views.js";
import { trackerResolvers } from "./tracker/controllers/tracker.controllers.js";
import { createTrackerTrpcClient } from "./clients/trpc.js";
import { logger, loggingPlugin } from "./middleware/logging.js";
import { sentryPlugin } from "./middleware/sentry.js";

// Decode JWT sub claim from Authorization header without re-validating.
// The Apollo Router already validates the JWT via JWKS; the subgraph
// only needs the sub to populate userId for downstream tRPC auth.
function getUserIdFromJwt(
  authorization: string | undefined,
): string | undefined {
  if (!authorization?.startsWith("Bearer ")) return undefined;
  const parts = authorization.slice(7).split(".");
  if (parts.length !== 3) return undefined;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1]!, "base64url").toString("utf8"),
    );
    return typeof payload.sub === "string" ? payload.sub : undefined;
  } catch {
    return undefined;
  }
}

const server = new ApolloServer({
  schema: buildSubgraphSchema([
    { typeDefs: trackerTypeDefs, resolvers: trackerResolvers },
  ]),
  plugins: [sentryPlugin, loggingPlugin],
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
    const rawHeaders = {
      "x-user-id": req.headers["x-user-id"] as string | undefined,
      "x-user-role": req.headers["x-user-role"] as string | undefined,
      "x-request-id": req.headers["x-request-id"] as string | undefined,
      authorization: req.headers["authorization"] as string | undefined,
    };
    const userId =
      rawHeaders["x-user-id"] ?? getUserIdFromJwt(rawHeaders.authorization);
    const headers = { ...rawHeaders, "x-user-id": userId };
    return {
      ...headers,
      userId,
      userRole: headers["x-user-role"],
      trackerTrpc: createTrackerTrpcClient(headers),
    };
  },
});

logger.info({ url }, "subgraph tracker ready");
