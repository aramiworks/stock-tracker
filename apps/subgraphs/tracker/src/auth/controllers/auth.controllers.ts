import type { SubgraphContext } from "../../context.js";

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: SubgraphContext) => {
      return context.apiTrpc.auth.me.query();
    },
  },
  User: {
    __resolveReference: async (ref: { id: string }) => {
      return ref;
    },
  },
};
