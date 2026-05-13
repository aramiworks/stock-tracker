import { Injectable } from "@nestjs/common";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class TrackerWatchlistManageModels {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.watches.findMany({
      where: { auth_user_id: userId, active: true },
      include: {
        watchable_unit: true,
        sku: true,
      },
      orderBy: { created_at: "desc" },
    });
  }

  findById(id: string) {
    return this.prisma.watches.findUnique({
      where: { id },
      include: {
        watchable_unit: true,
        sku: true,
      },
    });
  }

  create(data: {
    authUserId: string;
    watchableUnitId: string;
    skuId?: string;
    notifyPush: boolean;
    notifyEmail: boolean;
  }) {
    return this.prisma.watches.create({
      data: {
        auth_user_id: data.authUserId,
        watchable_unit_id: data.watchableUnitId,
        sku_id: data.skuId,
        notify_push: data.notifyPush,
        notify_email: data.notifyEmail,
      },
      include: {
        watchable_unit: true,
        sku: true,
      },
    });
  }

  update(
    id: string,
    data: {
      notify_push?: boolean;
      notify_email?: boolean;
      active?: boolean;
    },
  ) {
    return this.prisma.watches.update({
      where: { id },
      data,
      include: {
        watchable_unit: true,
        sku: true,
      },
    });
  }

  delete(id: string) {
    return this.prisma.watches.delete({ where: { id } });
  }

  // -- INF-1415: Hermès-style watchlist (unit-level watches) ----------------
  //
  // The Hermès restock alert UI lists watches at the watchable_unit level
  // (e.g. "Birkin 25") rather than the SKU level. These methods operate on
  // `watches` rows where sku_id IS NULL — one row per (user, unit) pair.
  //
  // Note on uniqueness: the @@unique([auth_user_id, watchable_unit_id, sku_id])
  // constraint does NOT enforce uniqueness when sku_id IS NULL (Postgres
  // treats NULLs as non-equal in unique indexes). We therefore use findFirst
  // + conditional create instead of Prisma's compound upsert, which doesn't
  // accept null for nullable compound keys.

  /**
   * Fetch the user's unit-level watchlist for the grouped UI: one row per
   * (user, watchable_unit) with sku_id = null, joined to the watchable_unit
   * plus the unit's active SKUs with their stock state.
   *
   * Results are ordered by brand → product_line → model_name → created_at
   * so the controller can do a single linear grouping pass.
   */
  findAllUnitWatchesForUser(userId: string) {
    return this.prisma.watches.findMany({
      where: {
        auth_user_id: userId,
        active: true,
        sku_id: null,
      },
      include: {
        watchable_unit: {
          include: {
            skus: {
              where: { active: true },
              include: { sku_stock_state: true },
            },
          },
        },
      },
      orderBy: [
        { watchable_unit: { brand: "asc" } },
        { watchable_unit: { product_line: "asc" } },
        { watchable_unit: { model_name: "asc" } },
        { created_at: "asc" },
      ],
    });
  }

  /**
   * Find a single unit-level watch for (userId, watchableUnitId). Returns
   * the watch joined to its watchable_unit + active SKUs + sku_stock_state.
   * Used by add/remove/detail to check existence and compose responses.
   */
  findUnitWatch(userId: string, watchableUnitId: string) {
    return this.prisma.watches.findFirst({
      where: {
        auth_user_id: userId,
        watchable_unit_id: watchableUnitId,
        sku_id: null,
      },
      include: {
        watchable_unit: {
          include: {
            skus: {
              where: { active: true },
              include: { sku_stock_state: true },
            },
          },
        },
      },
    });
  }

  /**
   * Create a unit-level watch with notify_push=true, notify_email=true (the
   * watchlist UI default). Caller must check for existence first via
   * findUnitWatch to keep add idempotent.
   */
  createUnitWatch(userId: string, watchableUnitId: string) {
    return this.prisma.watches.create({
      data: {
        auth_user_id: userId,
        watchable_unit_id: watchableUnitId,
        notify_push: true,
        notify_email: true,
      },
      include: {
        watchable_unit: {
          include: {
            skus: {
              where: { active: true },
              include: { sku_stock_state: true },
            },
          },
        },
      },
    });
  }

  /**
   * Reactivate a soft-deactivated unit-level watch. Used when a user
   * re-adds a unit they previously had on their watchlist.
   */
  reactivateUnitWatch(id: string) {
    return this.prisma.watches.update({
      where: { id },
      data: { active: true },
      include: {
        watchable_unit: {
          include: {
            skus: {
              where: { active: true },
              include: { sku_stock_state: true },
            },
          },
        },
      },
    });
  }

  /**
   * Delete the unit-level watch for (userId, watchableUnitId). Returns the
   * count of rows removed (0 or 1) so the controller can report `removed`.
   * Uses deleteMany to avoid throwing on missing rows (idempotent remove).
   */
  async deleteUnitWatch(userId: string, watchableUnitId: string) {
    const result = await this.prisma.watches.deleteMany({
      where: {
        auth_user_id: userId,
        watchable_unit_id: watchableUnitId,
        sku_id: null,
      },
    });
    return result.count;
  }

  /**
   * Recent drop events for any SKU under a watchable unit. Used by
   * watchlist.detail to surface restock history.
   */
  findDropEventsForUnit(watchableUnitId: string, limit = 10) {
    return this.prisma.drop_events.findMany({
      where: {
        sku: { watchable_unit_id: watchableUnitId },
      },
      orderBy: { detected_at: "desc" },
      take: limit,
    });
  }
}
