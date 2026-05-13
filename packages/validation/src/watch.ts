import { z } from "zod";

// -- Watch (user subscription to restock alerts) ---------------------------

export const watchCreateInputSchema = z.object({
  watchableUnitId: z.string().uuid(),
  skuId: z.string().uuid().optional(),
  notifyPush: z.boolean().default(true),
  notifyEmail: z.boolean().default(false),
});

export const watchUpdateInputSchema = z.object({
  id: z.string().uuid(),
  notifyPush: z.boolean().optional(),
  notifyEmail: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const watchOutputSchema = z.object({
  id: z.string().uuid(),
  authUserId: z.string().uuid(),
  watchableUnitId: z.string().uuid(),
  skuId: z.string().uuid().nullable(),
  notifyPush: z.boolean(),
  notifyEmail: z.boolean(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const watchWithCatalogOutputSchema = watchOutputSchema.extend({
  watchableUnit: z.object({
    id: z.string().uuid(),
    brand: z.string(),
    productLine: z.string(),
    modelName: z.string(),
    imageUrl: z.string().nullable(),
  }),
  sku: z
    .object({
      id: z.string().uuid(),
      color: z.string(),
      leather: z.string().nullable(),
      hardware: z.string().nullable(),
      size: z.string().nullable(),
    })
    .nullable(),
});

// -- Alert (notification sent to user) -------------------------------------

export const alertOutputSchema = z.object({
  id: z.string().uuid(),
  watchId: z.string().uuid(),
  dropEventId: z.string().uuid(),
  channel: z.string(),
  sentAt: z.date().nullable(),
  readAt: z.date().nullable(),
  createdAt: z.date(),
});

export const alertWithDetailsOutputSchema = alertOutputSchema.extend({
  dropEvent: z.object({
    id: z.string().uuid(),
    skuId: z.string().uuid(),
    sourceUrl: z.string().nullable(),
    detectedAt: z.date(),
  }),
});

// -- DropEvent (scraper-detected restock) ----------------------------------

export const dropEventOutputSchema = z.object({
  id: z.string().uuid(),
  skuId: z.string().uuid(),
  sourceUrl: z.string().nullable(),
  detectedAt: z.date(),
  expiredAt: z.date().nullable(),
});

// -- Watchlist (Hermès-style restock alert UI) -----------------------------
//
// New procedures (INF-1415) layered on top of the `watches` table:
//   • watchlist.list   → grouped by (brand, productLine) with derived state
//   • watchlist.detail → single entry + SKUs + recent drop events
//   • watchlist.add    → idempotent create scoped to (userId, watchableUnitId)
//   • watchlist.remove → delete by watchableUnitId for the current user
//
// `state` is derived from `sku_stock_state` rows across the unit's SKUs:
//   - any SKU in_stock → "in_stock"
//   - all known SKUs out_of_stock → "out_of_stock"
//   - no state recorded → "unknown"

export const watchlistStateSchema = z.enum([
  "in_stock",
  "out_of_stock",
  "unknown",
]);

export const watchlistEntryOutputSchema = z.object({
  id: z.string().uuid(),
  watchableUnitId: z.string().uuid(),
  brand: z.string(),
  productLine: z.string(),
  modelName: z.string(),
  imageUrl: z.string().nullable(),
  notifyPush: z.boolean(),
  notifyEmail: z.boolean(),
  createdAt: z.date(),
  state: watchlistStateSchema,
  lastRestockedAt: z.date().nullable(),
});

export const watchlistGroupOutputSchema = z.object({
  brand: z.string(),
  productLine: z.string(),
  entries: z.array(watchlistEntryOutputSchema),
});

export const watchlistListOutputSchema = z.array(watchlistGroupOutputSchema);

export const watchlistAddInputSchema = z.object({
  watchableUnitId: z.string().uuid(),
});

export const watchlistRemoveInputSchema = z.object({
  watchableUnitId: z.string().uuid(),
});

export const watchlistRemoveOutputSchema = z.object({
  removed: z.boolean(),
});

export const watchlistDetailInputSchema = z.object({
  watchableUnitId: z.string().uuid(),
});

export const watchlistDetailSkuSchema = z.object({
  id: z.string().uuid(),
  color: z.string(),
  leather: z.string().nullable(),
  hardware: z.string().nullable(),
  size: z.string().nullable(),
  referenceCode: z.string().nullable(),
  imageUrl: z.string().nullable(),
  inStock: z.boolean().nullable(),
  lastChecked: z.date().nullable(),
});

export const watchlistDetailDropEventSchema = z.object({
  id: z.string().uuid(),
  skuId: z.string().uuid(),
  sourceUrl: z.string().nullable(),
  detectedAt: z.date(),
});

export const watchlistDetailOutputSchema = z.object({
  entry: watchlistEntryOutputSchema,
  skus: z.array(watchlistDetailSkuSchema),
  dropEvents: z.array(watchlistDetailDropEventSchema),
});
