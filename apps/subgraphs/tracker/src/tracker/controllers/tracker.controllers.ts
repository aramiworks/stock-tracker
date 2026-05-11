import type { SubgraphContext } from "../../context.js";

export const trackerResolvers = {
  Query: {
    dashboard: async (_: unknown, __: unknown, context: SubgraphContext) => {
      return context.trackerTrpc.tracker.dashboard.home.summary.query();
    },
    catalog: async (
      _: unknown,
      args: {
        brand?: string;
        productLine?: string;
        search?: string;
        activeOnly?: boolean;
        cursor?: string;
        limit?: number;
      },
      context: SubgraphContext,
    ) => {
      return context.trackerTrpc.tracker.catalog.browse.list.query({
        brand: args.brand as Parameters<
          typeof context.trackerTrpc.tracker.catalog.browse.list.query
        >[0]["brand"],
        productLine: args.productLine ?? undefined,
        search: args.search ?? undefined,
        activeOnly: args.activeOnly ?? true,
        cursor: args.cursor ?? undefined,
        limit: args.limit,
      });
    },
    catalogItem: async (
      _: unknown,
      args: { id: string },
      context: SubgraphContext,
    ) => {
      return context.trackerTrpc.tracker.catalog.browse.byId.query({
        id: args.id,
      });
    },
    catalogList: async (_: unknown, __: unknown, context: SubgraphContext) => {
      return context.trackerTrpc.tracker.catalog.list.query();
    },
    watches: async (_: unknown, __: unknown, context: SubgraphContext) => {
      return context.trackerTrpc.tracker.watchlist.manage.list.query();
    },
    alerts: async (
      _: unknown,
      args: { unreadOnly?: boolean; cursor?: string; limit?: number },
      context: SubgraphContext,
    ) => {
      return context.trackerTrpc.tracker.alerts.feed.list.query({
        unreadOnly: args.unreadOnly ?? false,
        cursor: args.cursor ?? undefined,
        limit: args.limit ?? 20,
      });
    },
    unreadAlertCount: async (
      _: unknown,
      __: unknown,
      context: SubgraphContext,
    ) => {
      const result =
        await context.trackerTrpc.tracker.alerts.feed.unreadCount.query();
      return result.count;
    },
  },
  Mutation: {
    createWatch: async (
      _: unknown,
      args: {
        input: {
          watchableUnitId: string;
          skuId?: string;
          notifyPush?: boolean;
          notifyEmail?: boolean;
        };
      },
      context: SubgraphContext,
    ) => {
      return context.trackerTrpc.tracker.watchlist.manage.create.mutate(
        args.input,
      );
    },
    updateWatch: async (
      _: unknown,
      args: {
        input: {
          id: string;
          notifyPush?: boolean;
          notifyEmail?: boolean;
          active?: boolean;
        };
      },
      context: SubgraphContext,
    ) => {
      return context.trackerTrpc.tracker.watchlist.manage.update.mutate(
        args.input,
      );
    },
    deleteWatch: async (
      _: unknown,
      args: { id: string },
      context: SubgraphContext,
    ) => {
      const result =
        await context.trackerTrpc.tracker.watchlist.manage.delete.mutate({
          id: args.id,
        });
      return result.success;
    },
    markAlertRead: async (
      _: unknown,
      args: { id: string },
      context: SubgraphContext,
    ) => {
      const result =
        await context.trackerTrpc.tracker.alerts.feed.markRead.mutate({
          id: args.id,
        });
      return result.success;
    },
  },
  WatchableUnit: {
    __resolveReference: async (
      ref: { id: string },
      context: SubgraphContext,
    ) => {
      return context.trackerTrpc.tracker.catalog.browse.byId.query({
        id: ref.id,
      });
    },
  },
  Sku: {
    __resolveReference: async (ref: { id: string }) => {
      return ref;
    },
  },
  Watch: {
    __resolveReference: async (ref: { id: string }) => {
      return ref;
    },
  },
};
