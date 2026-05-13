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

// -- INF-1415 watchlist types ------------------------------------------------

type UnitWatchWithRelations = NonNullable<
  Awaited<ReturnType<TrackerWatchlistManageModels["findUnitWatch"]>>
>;
type SkuWithState = UnitWatchWithRelations["watchable_unit"]["skus"][number];

type WatchlistState = "in_stock" | "out_of_stock" | "unknown";

/**
 * Derive the watchlist entry's stock state from per-SKU stock state rows.
 *
 *   - any SKU `in_stock=true` (state row exists) → "in_stock"
 *   - all SKUs with state rows are `in_stock=false` AND there is at least one → "out_of_stock"
 *   - otherwise (no state recorded yet) → "unknown"
 *
 * This is intentionally simple — a unit is considered "in stock" the moment
 * any of its SKUs becomes available, and only "out of stock" when every
 * known SKU has been confirmed unavailable.
 */
function deriveState(skus: SkuWithState[]): WatchlistState {
  let knownStates = 0;
  for (const sku of skus) {
    const state = sku.sku_stock_state;
    if (!state) continue;
    knownStates += 1;
    if (state.in_stock) return "in_stock";
  }
  if (knownStates > 0) return "out_of_stock";
  return "unknown";
}

const mapWatchlistEntry = (
  w: UnitWatchWithRelations,
  lastRestockedAt: Date | null,
) => ({
  id: w.id,
  watchableUnitId: w.watchable_unit_id,
  brand: w.watchable_unit.brand,
  productLine: w.watchable_unit.product_line,
  modelName: w.watchable_unit.model_name,
  imageUrl: w.watchable_unit.image_url,
  notifyPush: w.notify_push,
  notifyEmail: w.notify_email,
  createdAt: w.created_at,
  state: deriveState(w.watchable_unit.skus),
  lastRestockedAt,
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

  // -- INF-1415: Hermès-style watchlist procedures --------------------------

  /**
   * Returns the user's watchlist grouped by (brand, productLine) with per-entry
   * state derivation. Inner `entries` are sorted by model_name → created_at
   * (Prisma's ORDER BY already returns rows in that order, so we just do a
   * linear group pass here).
   */
  async listGrouped(userId: string) {
    const watches = await this.models.findAllUnitWatchesForUser(userId);

    // Batch-fetch latest restock per unit so we don't N+1 the DB. For small
    // watchlists (<50 units typical) this stays single-digit ms.
    const lastRestockedByUnit = await this.fetchLastRestockedByUnit(
      watches.map((w) => w.watchable_unit_id),
    );

    const groups: {
      brand: string;
      productLine: string;
      entries: ReturnType<typeof mapWatchlistEntry>[];
    }[] = [];
    let current: (typeof groups)[number] | undefined;

    for (const w of watches) {
      const lastRestockedAt =
        lastRestockedByUnit.get(w.watchable_unit_id) ?? null;
      const entry = mapWatchlistEntry(w, lastRestockedAt);
      if (
        !current ||
        current.brand !== entry.brand ||
        current.productLine !== entry.productLine
      ) {
        current = {
          brand: entry.brand,
          productLine: entry.productLine,
          entries: [],
        };
        groups.push(current);
      }
      current.entries.push(entry);
    }
    return groups;
  }

  /**
   * Detail composition for a single watchlist entry: the entry itself, the
   * unit's active SKUs (with per-SKU stock state), and the unit's recent
   * drop events. Throws NOT_FOUND if the user does not have a unit-level
   * watch for this watchable_unit_id (which doubles as authorization — only
   * the owning user can read it).
   */
  async detail(input: { watchableUnitId: string }, userId: string) {
    const watch = await this.models.findUnitWatch(
      userId,
      input.watchableUnitId,
    );
    if (!watch) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Watchlist entry for ${input.watchableUnitId} not found`,
      });
    }

    const dropEvents = await this.models.findDropEventsForUnit(
      input.watchableUnitId,
    );
    const lastRestockedAt = dropEvents[0]?.detected_at ?? null;

    return {
      entry: mapWatchlistEntry(watch, lastRestockedAt),
      skus: watch.watchable_unit.skus.map((s) => ({
        id: s.id,
        color: s.color,
        leather: s.leather,
        hardware: s.hardware,
        size: s.size,
        referenceCode: s.reference_code,
        imageUrl: s.image_url,
        inStock: s.sku_stock_state?.in_stock ?? null,
        lastChecked: s.sku_stock_state?.last_checked ?? null,
      })),
      dropEvents: dropEvents.map((d) => ({
        id: d.id,
        skuId: d.sku_id,
        sourceUrl: d.source_url,
        detectedAt: d.detected_at,
      })),
    };
  }

  /**
   * Idempotent: returns the existing entry if the user already has a watch
   * on this unit (reactivating soft-deleted rows), otherwise creates a new
   * watch with notify_push=true, notify_email=true.
   */
  async add(input: { watchableUnitId: string }, userId: string) {
    const existing = await this.models.findUnitWatch(
      userId,
      input.watchableUnitId,
    );

    let watch: UnitWatchWithRelations;
    if (existing) {
      if (!existing.active) {
        watch = await this.models.reactivateUnitWatch(existing.id);
      } else {
        watch = existing;
      }
    } else {
      watch = await this.models.createUnitWatch(userId, input.watchableUnitId);
    }

    const dropEvents = await this.models.findDropEventsForUnit(
      input.watchableUnitId,
      1,
    );
    return mapWatchlistEntry(watch, dropEvents[0]?.detected_at ?? null);
  }

  /**
   * Idempotent: returns { removed: false } when no matching watch exists.
   * Hard-deletes the watch row (and any cascaded alerts via the alerts
   * onDelete: Cascade FK).
   */
  async remove(input: { watchableUnitId: string }, userId: string) {
    const count = await this.models.deleteUnitWatch(
      userId,
      input.watchableUnitId,
    );
    return { removed: count > 0 };
  }

  /**
   * Build a Map of watchable_unit_id → latest drop_event.detected_at, used
   * by `listGrouped` to populate per-entry `lastRestockedAt`. Issues one
   * indexed query per unit (drop_events.@@index([sku_id, detected_at])),
   * parallelized via Promise.all. For watchlists >50 units we should swap
   * to a single grouped query — flagged in conventions/backend.md.
   */
  private async fetchLastRestockedByUnit(
    unitIds: string[],
  ): Promise<Map<string, Date>> {
    const out = new Map<string, Date>();
    if (unitIds.length === 0) return out;

    const results = await Promise.all(
      unitIds.map(async (id) => ({
        id,
        latest: await this.models.findDropEventsForUnit(id, 1),
      })),
    );
    for (const r of results) {
      const dt = r.latest[0]?.detected_at;
      if (dt) out.set(r.id, dt);
    }
    return out;
  }
}
