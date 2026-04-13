import type { TrpcClient } from "../../clients/trpc.js";

interface SubgraphContext {
  userId?: string;
  userRole?: string;
  trpc: TrpcClient;
}

export const trackerResolvers = {
  Query: {
    dashboard: async (_: unknown, __: unknown, context: SubgraphContext) => {
      return context.trpc.tracker.dashboard.home.summary.query();
    },
    accounts: async (
      _: unknown,
      args: { sortBy?: string; sortOrder?: string; search?: string },
      context: SubgraphContext,
    ) => {
      return context.trpc.tracker.accounts.list.all.query({
        sortBy: args.sortBy as "store_name" | "created_at" | undefined,
        sortOrder: args.sortOrder as "asc" | "desc" | undefined,
        search: args.search ?? undefined,
      });
    },
    account: async (
      _: unknown,
      args: { id: string },
      context: SubgraphContext,
    ) => {
      return context.trpc.tracker.accounts.detail.byId.query(args);
    },
    purchases: async (
      _: unknown,
      args: {
        accountId?: string;
        sortOrder?: string;
        dateRange?: { from?: string; to?: string };
        amountRange?: { min?: number; max?: number };
        itemCategory?: string;
        search?: string;
      },
      context: SubgraphContext,
    ) => {
      const result = await context.trpc.tracker.history.browse.list.query({
        accountId: args.accountId ?? undefined,
        sortOrder: (args.sortOrder as "asc" | "desc") ?? undefined,
        dateRange: args.dateRange ?? undefined,
        amountRange: args.amountRange ?? undefined,
        itemCategory:
          (args.itemCategory as
            | "브레이슬릿"
            | "목걸이"
            | "시계"
            | "반지"
            | "귀걸이"
            | "가방"
            | "지갑"
            | "벨트"
            | "기타") ?? undefined,
        search: args.search ?? undefined,
      });
      return result.items;
    },
  },
  Mutation: {
    createAccount: async (
      _: unknown,
      args: { input: { storeName: string; saName?: string; notes?: string } },
      context: SubgraphContext,
    ) => {
      return context.trpc.tracker.accounts.list.create.mutate(args.input);
    },
    updateAccount: async (
      _: unknown,
      args: {
        input: {
          id: string;
          storeName?: string;
          saName?: string;
          notes?: string;
        };
      },
      context: SubgraphContext,
    ) => {
      return context.trpc.tracker.accounts.detail.update.mutate(args.input);
    },
    deleteAccount: async (
      _: unknown,
      args: { id: string },
      context: SubgraphContext,
    ) => {
      const result = await context.trpc.tracker.accounts.detail.delete.mutate({
        id: args.id,
      });
      return result.success;
    },
    createPurchase: async (
      _: unknown,
      args: { input: Record<string, unknown> },
      context: SubgraphContext,
    ) => {
      return context.trpc.tracker.purchases.manage.create.mutate(
        args.input as Parameters<
          typeof context.trpc.tracker.purchases.manage.create.mutate
        >[0],
      );
    },
    updatePurchase: async (
      _: unknown,
      args: { input: Record<string, unknown> },
      context: SubgraphContext,
    ) => {
      return context.trpc.tracker.purchases.manage.update.mutate(
        args.input as Parameters<
          typeof context.trpc.tracker.purchases.manage.update.mutate
        >[0],
      );
    },
    deletePurchase: async (
      _: unknown,
      args: { id: string },
      context: SubgraphContext,
    ) => {
      const result = await context.trpc.tracker.purchases.manage.delete.mutate({
        id: args.id,
      });
      return result.success;
    },
  },
  Account: {
    __resolveReference: async (
      ref: { id: string },
      context: SubgraphContext,
    ) => {
      return context.trpc.tracker.accounts.detail.byId.query({ id: ref.id });
    },
    purchases: async (
      parent: { id: string },
      _: unknown,
      context: SubgraphContext,
    ) => {
      const result = await context.trpc.tracker.history.browse.list.query({
        accountId: parent.id,
      });
      return result.items;
    },
  },
  Purchase: {
    __resolveReference: async (ref: { id: string }) => {
      return ref;
    },
  },
};
