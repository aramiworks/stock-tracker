import { Injectable } from "@nestjs/common";
import { TrpcService } from "./trpc.service.js";
import { AuthControllers } from "../auth/controllers/index.js";
import { authViews } from "../auth/views/index.js";

@Injectable()
export class TrpcRouter {
  readonly appRouter;

  constructor(
    private readonly trpc: TrpcService,
    private readonly authControllers: AuthControllers,
  ) {
    this.appRouter = this.trpc.router({
      auth: this.trpc.router({
        me: this.trpc.protectedProcedure
          .output(authViews.me.output)
          .query(async ({ ctx }) => {
            return this.authControllers.me(ctx.userId);
          }),
        upsertFromSupabase: this.trpc.protectedProcedure
          .input(authViews.upsert.input)
          .output(authViews.upsert.output)
          .mutation(async ({ ctx, input }) => {
            return this.authControllers.upsertFromSupabase({
              supabaseId: ctx.userId,
              email: input.email,
              displayName: input.displayName,
            });
          }),
      }),
    });
  }

  get createContext() {
    return this.trpc.createContext;
  }
}

export type AuthAppRouter = TrpcRouter["appRouter"];
