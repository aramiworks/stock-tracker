import type { SubgraphContext } from "../../context.js";

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: SubgraphContext) => {
      return context.authTrpc.auth.me.query();
    },
  },
  Mutation: {
    upsertUser: async (
      _: unknown,
      args: { email: string; displayName?: string | null },
      context: SubgraphContext,
    ) => {
      return context.authTrpc.auth.upsertFromSupabase.mutate({
        email: args.email,
        displayName: args.displayName ?? null,
      });
    },
  },
  User: {
    __resolveReference: async (ref: { id: string }) => {
      return ref;
    },
  },
};
