import { Injectable } from "@nestjs/common";
import { TrpcService } from "./trpc.service.js";
import { TrackerDashboardHomeControllers } from "../tracker/flows/dashboard/home/controllers/index.js";
import { trackerDashboardHomeViews } from "../tracker/flows/dashboard/home/views/index.js";
import { TrackerCatalogBrowseControllers } from "../tracker/flows/catalog/browse/controllers/index.js";
import { trackerCatalogBrowseViews } from "../tracker/flows/catalog/browse/views/index.js";
import { TrackerWatchlistManageControllers } from "../tracker/flows/watchlist/manage/controllers/index.js";
import { trackerWatchlistManageViews } from "../tracker/flows/watchlist/manage/views/index.js";
import { TrackerAlertsFeedControllers } from "../tracker/flows/alerts/feed/controllers/index.js";
import { trackerAlertsFeedViews } from "../tracker/flows/alerts/feed/views/index.js";
import { TrackerAlertHistoryBrowseControllers } from "../tracker/flows/alertHistory/browse/controllers/index.js";
import { trackerAlertHistoryBrowseViews } from "../tracker/flows/alertHistory/browse/views/index.js";
import { TrackerIngestDropEventControllers } from "../tracker/flows/ingest/dropEvent/controllers/index.js";
import { trackerIngestDropEventViews } from "../tracker/flows/ingest/dropEvent/views/index.js";

@Injectable()
export class TrpcRouter {
  readonly appRouter;

  constructor(
    private readonly trpc: TrpcService,
    private readonly dashboardHomeControllers: TrackerDashboardHomeControllers,
    private readonly catalogBrowseControllers: TrackerCatalogBrowseControllers,
    private readonly watchlistManageControllers: TrackerWatchlistManageControllers,
    private readonly alertsFeedControllers: TrackerAlertsFeedControllers,
    private readonly alertHistoryBrowseControllers: TrackerAlertHistoryBrowseControllers,
    private readonly ingestDropEventControllers: TrackerIngestDropEventControllers,
  ) {
    const dashboardRouter = this.trpc.router({
      home: this.trpc.router({
        summary: this.trpc.protectedProcedure
          .output(trackerDashboardHomeViews.summary.output)
          .query(async ({ ctx }) => {
            return this.dashboardHomeControllers.summary(ctx.userId);
          }),
      }),
    });

    const catalogRouter = this.trpc.router({
      // Anonymous-readable grouped catalog for the Shengsho-style browse UI.
      // Returns all active watchable_units grouped by product_line so
      // unauthenticated users can browse before signing in.
      list: this.trpc.publicProcedure
        .output(trackerCatalogBrowseViews.listGrouped.output)
        .query(async () => {
          return this.catalogBrowseControllers.listGrouped();
        }),
      browse: this.trpc.router({
        list: this.trpc.protectedProcedure
          .input(trackerCatalogBrowseViews.list.input)
          .output(trackerCatalogBrowseViews.list.output)
          .query(async ({ input }) => {
            return this.catalogBrowseControllers.list(input);
          }),
        byId: this.trpc.protectedProcedure
          .input(trackerCatalogBrowseViews.byId.input)
          .output(trackerCatalogBrowseViews.byId.output)
          .query(async ({ input }) => {
            return this.catalogBrowseControllers.byId(input);
          }),
      }),
    });

    const watchlistRouter = this.trpc.router({
      // INF-1415: Hermès-style watchlist procedures.
      // `list`/`detail`/`add`/`remove` operate at the watchable_unit level
      // (sku_id IS NULL on the underlying `watches` row) and return the
      // grouped/derived shape consumed by the watchlist UI. The legacy
      // `manage.*` procedures below remain for SKU-scoped watch CRUD used
      // by tests and pre-INF-1415 callers.
      list: this.trpc.protectedProcedure
        .output(trackerWatchlistManageViews.listGrouped.output)
        .query(async ({ ctx }) => {
          return this.watchlistManageControllers.listGrouped(ctx.userId);
        }),
      detail: this.trpc.protectedProcedure
        .input(trackerWatchlistManageViews.detail.input)
        .output(trackerWatchlistManageViews.detail.output)
        .query(async ({ ctx, input }) => {
          return this.watchlistManageControllers.detail(input, ctx.userId);
        }),
      add: this.trpc.protectedProcedure
        .input(trackerWatchlistManageViews.add.input)
        .output(trackerWatchlistManageViews.add.output)
        .mutation(async ({ ctx, input }) => {
          return this.watchlistManageControllers.add(input, ctx.userId);
        }),
      remove: this.trpc.protectedProcedure
        .input(trackerWatchlistManageViews.remove.input)
        .output(trackerWatchlistManageViews.remove.output)
        .mutation(async ({ ctx, input }) => {
          return this.watchlistManageControllers.remove(input, ctx.userId);
        }),
      manage: this.trpc.router({
        list: this.trpc.protectedProcedure
          .output(trackerWatchlistManageViews.list.output)
          .query(async ({ ctx }) => {
            return this.watchlistManageControllers.list(ctx.userId);
          }),
        create: this.trpc.protectedProcedure
          .input(trackerWatchlistManageViews.create.input)
          .output(trackerWatchlistManageViews.create.output)
          .mutation(async ({ ctx, input }) => {
            return this.watchlistManageControllers.create(input, ctx.userId);
          }),
        update: this.trpc.protectedProcedure
          .input(trackerWatchlistManageViews.update.input)
          .output(trackerWatchlistManageViews.update.output)
          .mutation(async ({ ctx, input }) => {
            return this.watchlistManageControllers.update(input, ctx.userId);
          }),
        delete: this.trpc.protectedProcedure
          .input(trackerWatchlistManageViews.delete.input)
          .output(trackerWatchlistManageViews.delete.output)
          .mutation(async ({ ctx, input }) => {
            return this.watchlistManageControllers.delete(input, ctx.userId);
          }),
      }),
    });

    const alertsRouter = this.trpc.router({
      feed: this.trpc.router({
        list: this.trpc.protectedProcedure
          .input(trackerAlertsFeedViews.list.input)
          .output(trackerAlertsFeedViews.list.output)
          .query(async ({ ctx, input }) => {
            return this.alertsFeedControllers.list(input, ctx.userId);
          }),
        markRead: this.trpc.protectedProcedure
          .input(trackerAlertsFeedViews.markRead.input)
          .output(trackerAlertsFeedViews.markRead.output)
          .mutation(async ({ input }) => {
            return this.alertsFeedControllers.markRead(input);
          }),
        unreadCount: this.trpc.protectedProcedure
          .output(trackerAlertsFeedViews.unreadCount.output)
          .query(async ({ ctx }) => {
            return this.alertsFeedControllers.unreadCount(ctx.userId);
          }),
      }),
    });

    const alertHistoryRouter = this.trpc.router({
      // INF-1479 — Paginated, user-scoped past drop events for the
      // alertHistory.browse UI. Cursor is the ISO timestamp of the last
      // event from the previous page.
      list: this.trpc.protectedProcedure
        .input(trackerAlertHistoryBrowseViews.list.input)
        .output(trackerAlertHistoryBrowseViews.list.output)
        .query(async ({ ctx, input }) => {
          return this.alertHistoryBrowseControllers.list(input, ctx.userId);
        }),
    });

    const ingestRouter = this.trpc.router({
      dropEvent: this.trpc.router({
        upsert: this.trpc.serviceProcedure
          .input(trackerIngestDropEventViews.upsert.input)
          .output(trackerIngestDropEventViews.upsert.output)
          .mutation(async ({ input }) => {
            return this.ingestDropEventControllers.upsert(input);
          }),
      }),
    });

    this.appRouter = this.trpc.router({
      tracker: this.trpc.router({
        dashboard: dashboardRouter,
        catalog: catalogRouter,
        watchlist: watchlistRouter,
        alerts: alertsRouter,
        alertHistory: alertHistoryRouter,
        ingest: ingestRouter,
      }),
    });
  }

  get createContext() {
    return this.trpc.createContext;
  }
}

export type TrackerAppRouter = TrpcRouter["appRouter"];
