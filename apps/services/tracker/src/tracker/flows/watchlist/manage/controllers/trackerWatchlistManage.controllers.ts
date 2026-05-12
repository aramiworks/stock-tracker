import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import { TrackerWatchlistManageModels } from "../models/index.js";

type WatchWithRelations = NonNullable<
  Awaited<ReturnType<TrackerWatchlistManageModels["findById"]>>
>;

const mapWatch = (w: WatchWithRelations) => ({
  id: w.id,
  authUserId: w.auth_user_id,
  watchableUnitId: w.watchable_unit_id,
  skuId: w.sku_id,
  notifyPush: w.notify_push,
  notifyEmail: w.notify_email,
  active: w.active,
  createdAt: w.created_at,
  updatedAt: w.updated_at,
  watchableUnit: {
    id: w.watchable_unit.id,
    brand: w.watchable_unit.brand,
    productLine: w.watchable_unit.product_line,
    modelName: w.watchable_unit.model_name,
    imageUrl: w.watchable_unit.image_url,
  },
  sku: w.sku
    ? {
        id: w.sku.id,
        color: w.sku.color,
        leather: w.sku.leather,
        hardware: w.sku.hardware,
        size: w.sku.size,
      }
    : null,
});

@Injectable()
export class TrackerWatchlistManageControllers {
  constructor(private readonly models: TrackerWatchlistManageModels) {}

  async list(userId: string) {
    const watches = await this.models.findAllForUser(userId);
    return watches.map(mapWatch);
  }

  async create(
    input: {
      watchableUnitId: string;
      skuId?: string;
      notifyPush: boolean;
      notifyEmail: boolean;
    },
    userId: string,
  ) {
    const watch = await this.models.create({
      authUserId: userId,
      ...input,
    });
    return mapWatch(watch);
  }

  async update(
    input: {
      id: string;
      notifyPush?: boolean;
      notifyEmail?: boolean;
      active?: boolean;
    },
    userId: string,
  ) {
    const existing = await this.models.findById(input.id);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Watch ${input.id} not found`,
      });
    }
    if (existing.auth_user_id !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not authorized to modify this watch",
      });
    }
    const data: Parameters<typeof this.models.update>[1] = {};
    if (input.notifyPush !== undefined) data.notify_push = input.notifyPush;
    if (input.notifyEmail !== undefined) data.notify_email = input.notifyEmail;
    if (input.active !== undefined) data.active = input.active;

    const updated = await this.models.update(input.id, data);
    return mapWatch(updated);
  }

  async delete(input: { id: string }, userId: string) {
    const existing = await this.models.findById(input.id);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Watch ${input.id} not found`,
      });
    }
    if (existing.auth_user_id !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not authorized to delete this watch",
      });
    }
    await this.models.delete(input.id);
    return { success: true as const };
  }
}
