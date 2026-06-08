import { Injectable } from "@nestjs/common";
import { PinoLoggerService } from "@stock-tracker/nestjs-common";
import {
  sendExpoPush,
  buildRestockNotification,
  type ExpoMessage,
} from "@stock-tracker/push";
import { TrackerIngestDropEventModels } from "../models/index.js";

/**
 * Inline restock-push dispatch (MCVL: Lifecycles = jobs/events). Called from the
 * ingest controller right after alerts are committed: load the undelivered push
 * alerts for the drop event, send one Expo message per (alert × active token),
 * then stamp delivered alerts and deactivate dead tokens.
 *
 * The entire flow is wrapped in try/catch and NEVER rethrows — alerts are
 * already committed, so a dispatch failure must not fail the ingest mutation.
 * The Phase C retry sweep re-delivers anything left with `sent_at=null`.
 */
@Injectable()
export class ExpoPushService {
  constructor(
    private readonly models: TrackerIngestDropEventModels,
    private readonly logger: PinoLoggerService,
  ) {}

  async dispatchForDropEvent(dropEventId: string): Promise<void> {
    try {
      const pending =
        await this.models.findPendingPushAlertsForDropEvent(dropEventId);
      if (pending.length === 0) {
        return;
      }

      const messages: ExpoMessage[] = [];
      const meta: Array<{ alertId: string; token: string }> = [];

      for (const alert of pending) {
        const { title, body } = buildRestockNotification({
          brand: alert.brand,
          modelName: alert.modelName,
        });
        for (const token of alert.tokens) {
          messages.push({
            to: token,
            title,
            body,
            data: {
              alertId: alert.alertId,
              dropEventId,
              watchableUnitId: alert.watchableUnitId,
              kind: "restock",
            },
          });
          meta.push({ alertId: alert.alertId, token });
        }
      }

      if (messages.length === 0) {
        // Alerts exist but no active device tokens — leave sent_at null so the
        // sweep can deliver once a device registers (within the retry window).
        return;
      }

      const accessToken = process.env["EXPO_ACCESS_TOKEN"];
      const results = await sendExpoPush(messages, { accessToken });

      const sentAlertIds = new Set<string>();
      const deadTokens = new Set<string>();

      results.forEach((result, idx) => {
        const m = meta[idx];
        if (!m) {
          return;
        }
        if (result.ok) {
          sentAlertIds.add(m.alertId);
        } else if (result.error === "DeviceNotRegistered") {
          deadTokens.add(m.token);
        }
      });

      if (sentAlertIds.size > 0) {
        await this.models.markAlertsSent([...sentAlertIds]);
      }
      for (const token of deadTokens) {
        await this.models.deactivateByToken(token);
      }

      this.logger.log(
        `restock dispatch: dropEvent=${dropEventId} messages=${messages.length} alertsSent=${sentAlertIds.size} deadTokens=${deadTokens.size}`,
      );
    } catch (err) {
      // Never rethrow — ingest already committed alerts; the sweep retries.
      this.logger.error(
        `restock dispatch failed for dropEvent=${dropEventId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
