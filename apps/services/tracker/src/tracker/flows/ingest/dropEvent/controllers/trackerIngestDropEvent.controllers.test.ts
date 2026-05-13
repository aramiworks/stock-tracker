import { describe, it, expect, beforeEach } from "@jest/globals";
import { TrackerIngestDropEventControllers } from "./trackerIngestDropEvent.controllers.js";
import type { TrackerIngestDropEventModels } from "../models/trackerIngestDropEvent.models.js";

const DROP_EVENT_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function createMockModels(
  overrides: Partial<Record<keyof TrackerIngestDropEventModels, unknown>> = {},
) {
  return {
    upsertDropEvent: async () => ({
      id: DROP_EVENT_ID,
      sku_id: "sku-1",
      source_url: "https://hermes.com/kr/item",
      detected_at: new Date(),
      expired_at: null,
      idempotency_key: "test-key-0123456789",
    }),
    findMatchingWatches: async () => [
      {
        id: "watch-1",
        auth_user_id: "user-1",
        watchable_unit_id: "wu-1",
        sku_id: "sku-1",
        notify_push: true,
        notify_email: false,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    createAlerts: async () => ({ count: 1 }),
    updateSkuStockState: async () => ({
      sku_id: "sku-1",
      in_stock: true,
      last_checked: new Date(),
      last_changed: new Date(),
      consecutive_errors: 0,
    }),
    countAlertsForDropEvent: async () => 0,
    ...overrides,
  } as unknown as TrackerIngestDropEventModels;
}

const INPUT = {
  skuId: "sku-1",
  sourceUrl: "https://hermes.com/kr/item",
  detectedAt: new Date().toISOString(),
  idempotencyKey: "test-key-0123456789",
};

describe("TrackerIngestDropEventControllers", () => {
  let controller: TrackerIngestDropEventControllers;

  describe("first call", () => {
    beforeEach(() => {
      controller = new TrackerIngestDropEventControllers(createMockModels());
    });

    it("creates alerts and returns count", async () => {
      const result = await controller.upsert(INPUT);
      expect(result.dropEventId).toBe(DROP_EVENT_ID);
      expect(result.alertsCreated).toBe(1);
    });
  });

  describe("idempotent retry (same idempotencyKey)", () => {
    beforeEach(() => {
      controller = new TrackerIngestDropEventControllers(
        createMockModels({
          countAlertsForDropEvent: async () => 1,
        }),
      );
    });

    it("returns 0 alertsCreated on retry", async () => {
      const result = await controller.upsert(INPUT);
      expect(result.dropEventId).toBe(DROP_EVENT_ID);
      expect(result.alertsCreated).toBe(0);
    });
  });

  describe("watch with both push and email", () => {
    let createAlertsCalled: Array<{
      watchId: string;
      dropEventId: string;
      channel: string;
    }>[];

    beforeEach(() => {
      createAlertsCalled = [];
      controller = new TrackerIngestDropEventControllers(
        createMockModels({
          findMatchingWatches: async () => [
            {
              id: "watch-2",
              auth_user_id: "user-2",
              watchable_unit_id: "wu-1",
              sku_id: "sku-1",
              notify_push: true,
              notify_email: true,
              active: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          createAlerts: async (
            rows: {
              watchId: string;
              dropEventId: string;
              channel: string;
            }[],
          ) => {
            createAlertsCalled.push(rows);
            return { count: rows.length };
          },
        }),
      );
    });

    it("creates one alert per channel", async () => {
      const result = await controller.upsert(INPUT);
      expect(result.alertsCreated).toBe(2);
      expect(createAlertsCalled[0]).toHaveLength(2);
      expect(createAlertsCalled[0]!.map((r) => r.channel).sort()).toEqual([
        "email",
        "push",
      ]);
    });
  });
});
