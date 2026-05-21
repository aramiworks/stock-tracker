import { Injectable } from "@nestjs/common";
import { TrackerAlertHistoryBrowseModels } from "../models/index.js";

type DropEventWithCatalog = Awaited<
  ReturnType<TrackerAlertHistoryBrowseModels["findForUser"]>
>[number];

/**
 * Mirror of the frontend `composeDescriptor` helper
 * (apps/mobile/.../tracker-watchlist-detail.controllers.tsx). Joins the
 * available SKU attributes with " · ", omitting null parts. We resolve this
 * server-side so the alertHistory UI doesn't need to re-implement the join
 * per row. `color` is non-nullable in the schema so the result is always a
 * non-empty string (we keep `string | null` on the return type to match the
 * GraphQL/Zod contract — the UI may receive null for future SKU shapes).
 */
const composeDescriptor = (sku: {
  color: string;
  leather: string | null;
  hardware: string | null;
  size: string | null;
}): string | null =>
  [sku.color, sku.leather, sku.hardware, sku.size]
    .filter((part): part is string => Boolean(part))
    .join(" · ");

/**
 * Map a single drop event row to the AlertHistoryEvent shape. `kind` defaults
 * to "restocked" — see TODO below.
 */
const mapEvent = (e: DropEventWithCatalog) => ({
  id: e.id,
  brand: e.sku.watchable_unit.brand,
  productLine: e.sku.watchable_unit.product_line,
  modelName: e.sku.watchable_unit.model_name,
  skuDescriptor: composeDescriptor({
    color: e.sku.color,
    leather: e.sku.leather,
    hardware: e.sku.hardware,
    size: e.sku.size,
  }),
  // INF-1479 — `drop_events` only records restock events today. Design
  // ships a "soldOut" row variant (teal indicator bar) that will appear
  // once we have a sold-out event source (separate column or table). For
  // now every row is "restocked".
  kind: "restocked" as const,
  detectedAt: e.detected_at,
});

@Injectable()
export class TrackerAlertHistoryBrowseControllers {
  constructor(private readonly models: TrackerAlertHistoryBrowseModels) {}

  /**
   * Paginated past drop events for the given user. Cursor is the
   * `detectedAt` ISO timestamp of the last event from the previous page.
   * Returns `nextCursor: null` on the final page.
   */
  async list(input: { limit: number; cursor?: string | null }, userId: string) {
    const cursorDate = input.cursor ? new Date(input.cursor) : null;

    const rows = await this.models.findForUser({
      userId,
      limit: input.limit,
      cursor: cursorDate,
    });

    let nextCursor: string | null = null;
    if (rows.length > input.limit) {
      const lastVisible = rows[input.limit - 1]!;
      nextCursor = lastVisible.detected_at.toISOString();
      rows.length = input.limit; // drop the peek row
    }

    return {
      events: rows.map(mapEvent),
      nextCursor,
    };
  }
}
