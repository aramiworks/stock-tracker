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

  /**
   * Loads the undelivered push alerts for a drop event, joined to each watch's
   * owner, their active device tokens, and the watchable unit's display fields.
   * One entry per alert; `tokens` is the set of active Expo tokens to notify.
   */
  async findPendingPushAlertsForDropEvent(dropEventId: string): Promise<
    Array<{
      alertId: string;
      userId: string;
      watchableUnitId: string;
      brand: string;
      productLine: string;
      modelName: string;
      tokens: string[];
    }>
  > {
    const alerts = await this.prisma.alerts.findMany({
      where: {
        drop_event_id: dropEventId,
        channel: "push",
        sent_at: null,
      },
      select: {
        id: true,
        watch: {
          select: {
            auth_user_id: true,
            watchable_unit_id: true,
            watchable_unit: {
              select: { brand: true, product_line: true, model_name: true },
            },
            auth_user: {
              select: {
                push_devices: {
                  where: { active: true },
                  select: { expo_token: true },
                },
              },
            },
          },
        },
      },
    });

    return alerts.map((a) => ({
      alertId: a.id,
      userId: a.watch.auth_user_id,
      watchableUnitId: a.watch.watchable_unit_id,
      brand: a.watch.watchable_unit.brand,
      productLine: a.watch.watchable_unit.product_line,
      modelName: a.watch.watchable_unit.model_name,
      tokens: a.watch.auth_user.push_devices.map((d) => d.expo_token),
    }));
  }

  /**
   * Stamps `sent_at=now` for the given alerts — but only those still unsent.
   * The `sent_at: null` guard is mandatory: it makes the inline dispatcher and
   * the Phase C retry sweep race-safe (worst case one duplicate push, never a
   * double-stamp). Returns the number of rows actually stamped.
   */
  async markAlertsSent(alertIds: string[]): Promise<number> {
    if (alertIds.length === 0) {
      return 0;
    }
    const result = await this.prisma.alerts.updateMany({
      where: { id: { in: alertIds }, sent_at: null },
      data: { sent_at: new Date() },
    });
    return result.count;
  }

  /**
   * Soft-deactivate a device token Expo reported as `DeviceNotRegistered`.
   */
  deactivateByToken(expoToken: string) {
    return this.prisma.push_devices.updateMany({
      where: { expo_token: expoToken, active: true },
      data: { active: false },
    });
  }
}
