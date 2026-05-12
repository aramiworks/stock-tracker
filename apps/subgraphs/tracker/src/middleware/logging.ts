import type { ApolloServerPlugin } from "@apollo/server";
import { createLogger } from "@stock-tracker/config";

const logger = createLogger({
  service: "subgraph-tracker",
  env: process.env["NODE_ENV"],
  betterStackToken: process.env["TRACKER_SUBGRAPH_BETTER_STACK_SOURCE_TOKEN"],
  betterStackIngestHost: process.env["BETTER_STACK_INGEST_HOST"],
});

export { logger };

export const loggingPlugin: ApolloServerPlugin = {
  async requestDidStart({ request, contextValue }) {
    const requestId =
      (contextValue as Record<string, unknown>)["x-request-id"] ?? "unknown";
    const reqLogger = logger.child({ requestId });

    reqLogger.info(
      { operation: request.operationName ?? "anonymous" },
      "graphql request started",
    );

    return {
      async didEncounterErrors({ errors }) {
        for (const error of errors) {
          reqLogger.error({ error: error.message }, "graphql error");
        }
      },
    };
  },
};
