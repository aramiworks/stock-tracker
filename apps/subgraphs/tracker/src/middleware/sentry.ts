import type { ApolloServerPlugin } from "@apollo/server";
import * as Sentry from "@sentry/node";

/**
 * Apollo plugin that scopes Sentry per request and captures GraphQL errors.
 *
 * Tags each error with the GraphQL operation name plus the requestId/userId
 * propagated from the Apollo Router so it can be correlated with the upstream
 * tRPC service spans (auth-service / tracker-service) — those services capture
 * their own errors against their own Sentry projects, so an error originating
 * in tRPC will appear in both projects with a shared requestId.
 */
export const sentryPlugin: ApolloServerPlugin = {
  async requestDidStart({ request, contextValue }) {
    const ctx = contextValue as Record<string, unknown>;
    const requestId = ctx["x-request-id"] as string | undefined;
    const userId = ctx["userId"] as string | undefined;
    const operation = request.operationName ?? "anonymous";

    return {
      async didEncounterErrors({ errors }) {
        const unexpected = errors.filter((e) => {
          const code = e.extensions?.code as string | undefined;
          return (
            code !== "UNAUTHENTICATED" &&
            code !== "FORBIDDEN" &&
            code !== "BAD_USER_INPUT" &&
            code !== "GRAPHQL_VALIDATION_FAILED" &&
            code !== "PERSISTED_QUERY_NOT_FOUND" &&
            code !== "PERSISTED_QUERY_NOT_SUPPORTED"
          );
        });
        if (unexpected.length === 0) return;
        Sentry.withScope((scope) => {
          scope.setTags({
            operation,
            ...(requestId && { requestId }),
          });
          if (userId) scope.setUser({ id: userId });
          for (const error of unexpected) {
            Sentry.captureException(error.originalError ?? error);
          }
        });
      },
    };
  },
};
