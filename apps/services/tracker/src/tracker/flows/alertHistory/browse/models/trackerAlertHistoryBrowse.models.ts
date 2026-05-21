import { Injectable } from "@nestjs/common";
import { PrismaService } from "@stock-tracker/nestjs-common";

/**
 * INF-1479 — Drop events scoped to the user's watchlist, ordered most-recent
 * first with cursor pagination on `detected_at`.
 *
 * Authorization is enforced by joining `drop_event → sku → watchable_unit`
 * against the user's `watches` rows. A drop event for SKU X (under unit U)
 * is visible to a user when either:
 *   - the user has a unit-level watch (`watch.sku_id IS NULL`,
 *     `watch.watchable_unit_id = U`), OR
 *   - the user has a SKU-level watch (`watch.sku_id = X`).
 *
 * The cursor is the `detected_at` timestamp of the last row from the
 * previous page so the WHERE clause is a single indexed range filter
 * (`drop_events.@@index([detected_at])`).
 */
@Injectable()
export class TrackerAlertHistoryBrowseModels {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch up to `limit + 1` drop events the given user is watching. The
   * controller uses the extra row as a peek to compute `nextCursor`.
   */
  findForUser(params: { userId: string; limit: number; cursor: Date | null }) {
    return this.prisma.drop_events.findMany({
      where: {
        ...(params.cursor && { detected_at: { lt: params.cursor } }),
        OR: [
          // Unit-level watch: user is watching the SKU's parent unit with no
          // specific sku_id, so every drop event under the unit qualifies.
          {
            sku: {
              watchable_unit: {
                watches: {
                  some: {
                    auth_user_id: params.userId,
                    active: true,
                    sku_id: null,
                  },
                },
              },
            },
          },
          // SKU-level watch: the user is watching this exact SKU.
          {
            sku: {
              watches: {
                some: {
                  auth_user_id: params.userId,
                  active: true,
                  // sku_id is implied by the `sku.watches` relation walk —
                  // these are only the watches that reference *this* SKU.
                },
              },
            },
          },
        ],
      },
      include: {
        sku: {
          include: {
            watchable_unit: true,
          },
        },
      },
      orderBy: { detected_at: "desc" },
      take: params.limit + 1,
    });
  }
}
