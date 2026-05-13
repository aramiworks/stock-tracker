import { Injectable } from "@nestjs/common";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class TrackerIngestDropEventModels {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upserts a drop event keyed on idempotency_key.
   * Returns the existing row on conflict (no-op retry).
   */
  async upsertDropEvent(params: {
    skuId: string;
    sourceUrl: string;
    detectedAt: Date;
    idempotencyKey: string;
  }) {
    return this.prisma.drop_events.upsert({
      where: { idempotency_key: params.idempotencyKey },
      create: {
        sku_id: params.skuId,
        source_url: params.sourceUrl,
        detected_at: params.detectedAt,
        idempotency_key: params.idempotencyKey,
      },
      update: {},
    });
  }

  /**
   * Finds active watches matching a SKU (directly or via the watchable unit).
   */
  findMatchingWatches(skuId: string) {
    return this.prisma.watches.findMany({
      where: {
        active: true,
        OR: [
          { sku_id: skuId },
          {
            sku_id: null,
            watchable_unit: { skus: { some: { id: skuId } } },
          },
        ],
      },
    });
  }

  /**
   * Creates alert rows — one per watch × channel.
   */
  createAlerts(
    rows: Array<{
      watchId: string;
      dropEventId: string;
      channel: string;
    }>,
  ) {
    return this.prisma.alerts.createMany({
      data: rows.map((r) => ({
        watch_id: r.watchId,
        drop_event_id: r.dropEventId,
        channel: r.channel,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Sets sku_stock_state to in_stock=true with last_changed=now.
   */
  updateSkuStockState(skuId: string) {
    const now = new Date();
    return this.prisma.sku_stock_state.upsert({
      where: { sku_id: skuId },
      create: {
        sku_id: skuId,
        in_stock: true,
        last_checked: now,
        last_changed: now,
      },
      update: {
        in_stock: true,
        last_checked: now,
        last_changed: now,
        consecutive_errors: 0,
      },
    });
  }

  /**
   * Checks whether alerts already exist for a given drop event.
   * Used to detect idempotent retries (drop event already processed).
   */
  countAlertsForDropEvent(dropEventId: string) {
    return this.prisma.alerts.count({
      where: { drop_event_id: dropEventId },
    });
  }
}
