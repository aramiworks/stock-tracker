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

@Injectable()
export class TrpcRouter {
  readonly appRouter;

  constructor(
    private readonly trpc: TrpcService,
    private readonly dashboardHomeControllers: TrackerDashboardHomeControllers,
    private readonly catalogBrowseControllers: TrackerCatalogBrowseControllers,
    private readonly watchlistManageControllers: TrackerWatchlistManageControllers,
    private readonly alertsFeedControllers: TrackerAlertsFeedControllers,
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

    this.appRouter = this.trpc.router({
      tracker: this.trpc.router({
        dashboard: dashboardRouter,
        catalog: catalogRouter,
        watchlist: watchlistRouter,
        alerts: alertsRouter,
      }),
    });
  }

  get createContext() {
    return this.trpc.createContext;
  }
}

export type TrackerAppRouter = TrpcRouter["appRouter"];
