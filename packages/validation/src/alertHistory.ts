import { z } from "zod";

// -- Alert history (INF-1479) ----------------------------------------------
//
// Paginated, user-scoped feed of past drop events that match the user's
// watchlist. Mirrors the catalog/watchlist Zod patterns (camelCase fields,
// nullable timestamps as `Date`). Cursor pagination uses the `detectedAt`
// ISO timestamp of the last row from the previous page so the server-side
// query can simply add `WHERE detected_at < cursor ORDER BY detected_at
// DESC LIMIT limit + 1`.
//
// `kind` is a union of "restocked" | "soldOut" to match the design (frontend
// renders both with the same row layout, soldOut differentiated by a teal
// left indicator bar). Today the controller always emits "restocked" because
// `drop_events` has no kind discriminator column — soldOut will land when we
// have a sold-out event source (tracked separately).

export const alertHistoryKindSchema = z.enum(["restocked", "soldOut"]);

export const alertHistoryListInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().datetime().nullable().optional(),
});

export const alertHistoryEventOutputSchema = z.object({
  id: z.string().uuid(),
  brand: z.string(),
  productLine: z.string(),
  modelName: z.string(),
  skuDescriptor: z.string().nullable(),
  kind: alertHistoryKindSchema,
  detectedAt: z.date(),
});

export const alertHistoryListOutputSchema = z.object({
  events: z.array(alertHistoryEventOutputSchema),
  nextCursor: z.string().datetime().nullable(),
});
