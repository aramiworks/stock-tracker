import { Injectable } from "@nestjs/common";
import { TrackerIngestDropEventModels } from "../models/index.js";

@Injectable()
export class TrackerIngestDropEventControllers {
  constructor(private readonly models: TrackerIngestDropEventModels) {}

  async upsert(input: {
    skuId: string;
    sourceUrl: string;
    detectedAt: string;
    idempotencyKey: string;
  }) {
    const dropEvent = await this.models.upsertDropEvent({
      skuId: input.skuId,
      sourceUrl: input.sourceUrl,
      detectedAt: new Date(input.detectedAt),
      idempotencyKey: input.idempotencyKey,
    });

    // Idempotent: if alerts already exist for this drop event, skip creation
    const existingAlerts = await this.models.countAlertsForDropEvent(
      dropEvent.id,
    );
    if (existingAlerts > 0) {
      return { dropEventId: dropEvent.id, alertsCreated: 0 };
    }

    const watches = await this.models.findMatchingWatches(input.skuId);

    const alertRows: Array<{
      watchId: string;
      dropEventId: string;
      channel: string;
    }> = [];

    for (const watch of watches) {
      if (watch.notify_push) {
        alertRows.push({
          watchId: watch.id,
          dropEventId: dropEvent.id,
          channel: "push",
        });
      }
      if (watch.notify_email) {
        alertRows.push({
          watchId: watch.id,
          dropEventId: dropEvent.id,
          channel: "email",
        });
      }
    }

    if (alertRows.length > 0) {
      await this.models.createAlerts(alertRows);
    }

    await this.models.updateSkuStockState(input.skuId);

    return { dropEventId: dropEvent.id, alertsCreated: alertRows.length };
  }
}
