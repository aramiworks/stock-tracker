import { Injectable } from "@nestjs/common";
import { TrpcService } from "./trpc.service.js";
import { TrackerDashboardHomeControllers } from "../tracker/flows/dashboard/home/controllers/index.js";
import { trackerDashboardHomeViews } from "../tracker/flows/dashboard/home/views/index.js";
import { TrackerAccountsListControllers } from "../tracker/flows/accounts/list/controllers/index.js";
import { trackerAccountsListViews } from "../tracker/flows/accounts/list/views/index.js";
import { TrackerAccountsDetailControllers } from "../tracker/flows/accounts/detail/controllers/index.js";
import { trackerAccountsDetailViews } from "../tracker/flows/accounts/detail/views/index.js";
import { TrackerHistoryBrowseControllers } from "../tracker/flows/history/browse/controllers/index.js";
import { trackerHistoryBrowseViews } from "../tracker/flows/history/browse/views/index.js";
import { TrackerPurchasesManageControllers } from "../tracker/flows/purchases/manage/controllers/index.js";
import { trackerPurchasesManageViews } from "../tracker/flows/purchases/manage/views/index.js";

@Injectable()
export class TrpcRouter {
  readonly appRouter;

  constructor(
    private readonly trpc: TrpcService,
    private readonly dashboardHomeControllers: TrackerDashboardHomeControllers,
    private readonly accountsListControllers: TrackerAccountsListControllers,
    private readonly accountsDetailControllers: TrackerAccountsDetailControllers,
    private readonly historyBrowseControllers: TrackerHistoryBrowseControllers,
    private readonly purchasesManageControllers: TrackerPurchasesManageControllers,
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

    const accountsRouter = this.trpc.router({
      list: this.trpc.router({
        all: this.trpc.protectedProcedure
          .input(trackerAccountsListViews.all.input)
          .output(trackerAccountsListViews.all.output)
          .query(async ({ ctx, input }) => {
            return this.accountsListControllers.all(input, ctx.userId);
          }),
        create: this.trpc.protectedProcedure
          .input(trackerAccountsListViews.create.input)
          .output(trackerAccountsListViews.create.output)
          .mutation(async ({ ctx, input }) => {
            return this.accountsListControllers.create(input, ctx.userId);
          }),
      }),
      detail: this.trpc.router({
        byId: this.trpc.protectedProcedure
          .input(trackerAccountsDetailViews.byId.input)
          .output(trackerAccountsDetailViews.byId.output)
          .query(async ({ ctx, input }) => {
            return this.accountsDetailControllers.byId(input, ctx.userId);
          }),
        update: this.trpc.protectedProcedure
          .input(trackerAccountsDetailViews.update.input)
          .output(trackerAccountsDetailViews.update.output)
          .mutation(async ({ ctx, input }) => {
            return this.accountsDetailControllers.update(input, ctx.userId);
          }),
        delete: this.trpc.protectedProcedure
          .input(trackerAccountsDetailViews.delete.input)
          .output(trackerAccountsDetailViews.delete.output)
          .mutation(async ({ ctx, input }) => {
            return this.accountsDetailControllers.delete(input, ctx.userId);
          }),
      }),
    });

    const historyRouter = this.trpc.router({
      browse: this.trpc.router({
        list: this.trpc.protectedProcedure
          .input(trackerHistoryBrowseViews.list.input)
          .output(trackerHistoryBrowseViews.list.output)
          .query(async ({ ctx, input }) => {
            return this.historyBrowseControllers.list(input, ctx.userId);
          }),
      }),
    });

    const purchasesRouter = this.trpc.router({
      manage: this.trpc.router({
        byId: this.trpc.protectedProcedure
          .input(trackerPurchasesManageViews.byId.input)
          .output(trackerPurchasesManageViews.byId.output)
          .query(async ({ ctx, input }) => {
            return this.purchasesManageControllers.byId(input, ctx.userId);
          }),
        create: this.trpc.protectedProcedure
          .input(trackerPurchasesManageViews.create.input)
          .output(trackerPurchasesManageViews.create.output)
          .mutation(async ({ ctx, input }) => {
            return this.purchasesManageControllers.create(input, ctx.userId);
          }),
        update: this.trpc.protectedProcedure
          .input(trackerPurchasesManageViews.update.input)
          .output(trackerPurchasesManageViews.update.output)
          .mutation(async ({ ctx, input }) => {
            return this.purchasesManageControllers.update(input, ctx.userId);
          }),
        delete: this.trpc.protectedProcedure
          .input(trackerPurchasesManageViews.delete.input)
          .output(trackerPurchasesManageViews.delete.output)
          .mutation(async ({ ctx, input }) => {
            return this.purchasesManageControllers.delete(input, ctx.userId);
          }),
      }),
    });

    this.appRouter = this.trpc.router({
      tracker: this.trpc.router({
        dashboard: dashboardRouter,
        accounts: accountsRouter,
        history: historyRouter,
        purchases: purchasesRouter,
      }),
    });
  }

  get createContext() {
    return this.trpc.createContext;
  }
}

export type TrackerAppRouter = TrpcRouter["appRouter"];
