import { describe, expect, it, jest } from "@jest/globals";
import { TrackerIngestDropEventModels } from "./trackerIngestDropEvent.models.js";
import type { PrismaService } from "@stock-tracker/nestjs-common";

const DROP_EVENT_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function createModels(prismaOverrides: Record<string, unknown> = {}) {
  const alertsFindMany = jest.fn(async (_args: unknown) => [] as unknown[]);
  const alertsUpdateMany = jest.fn(async (_args: unknown) => ({ count: 0 }));
  const pushDevicesUpdateMany = jest.fn(async (_args: unknown) => ({
    count: 1,
  }));
  const prisma = {
    alerts: { findMany: alertsFindMany, updateMany: alertsUpdateMany },
    push_devices: { updateMany: pushDevicesUpdateMany },
    ...prismaOverrides,
  } as unknown as PrismaService;
  return {
    models: new TrackerIngestDropEventModels(prisma),
    alertsFindMany,
    alertsUpdateMany,
    pushDevicesUpdateMany,
  };
}

describe("TrackerIngestDropEventModels.markAlertsSent", () => {
  it("is a no-op (returns 0, no DB call) for an empty id list", async () => {
    const { models, alertsUpdateMany } = createModels();
    const count = await models.markAlertsSent([]);
    expect(count).toBe(0);
    expect(alertsUpdateMany).not.toHaveBeenCalled();
  });

  it("scopes the update to the given ids and the null sent_at guard, returning the stamped count", async () => {
    const updateMany = jest.fn(async (_args: unknown) => ({ count: 2 }));
    const { models } = createModels({
      alerts: { findMany: jest.fn(), updateMany },
    });

    const count = await models.markAlertsSent(["a-1", "a-2", "a-3"]);

    expect(count).toBe(2);
    const args = updateMany.mock.calls[0]![0]! as {
      where: { id: { in: string[] }; sent_at: null };
      data: { sent_at: Date };
    };
    expect(args.where.id).toEqual({ in: ["a-1", "a-2", "a-3"] });
    expect(args.where.sent_at).toBeNull();
    expect(args.data.sent_at).toBeInstanceOf(Date);
  });
});

describe("TrackerIngestDropEventModels.deactivateByToken", () => {
  it("soft-deactivates the active row for a token", async () => {
    const { models, pushDevicesUpdateMany } = createModels();

    await models.deactivateByToken("ExponentPushToken[dead]");

    const args = pushDevicesUpdateMany.mock.calls[0]![0]! as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    };
    expect(args.where).toEqual({
      expo_token: "ExponentPushToken[dead]",
      active: true,
    });
    expect(args.data).toEqual({ active: false });
  });
});

describe("TrackerIngestDropEventModels.findPendingPushAlertsForDropEvent", () => {
  it("queries unsent push alerts and flattens the joined shape", async () => {
    const findMany = jest.fn(async (_args: unknown) => [
      {
        id: "alert-1",
        watch: {
          auth_user_id: "user-1",
          watchable_unit_id: "wu-1",
          watchable_unit: {
            brand: "Hermes",
            product_line: "Birkin",
            model_name: "Birkin 25",
          },
          auth_user: {
            push_devices: [{ expo_token: "tok-a" }, { expo_token: "tok-b" }],
          },
        },
      },
    ]);
    const { models } = createModels({
      alerts: { findMany, updateMany: jest.fn() },
    });

    const result =
      await models.findPendingPushAlertsForDropEvent(DROP_EVENT_ID);

    const where = (findMany.mock.calls[0]![0]! as { where: unknown }).where;
    expect(where).toMatchObject({
      drop_event_id: DROP_EVENT_ID,
      channel: "push",
      sent_at: null,
    });
    expect(result).toEqual([
      {
        alertId: "alert-1",
        userId: "user-1",
        watchableUnitId: "wu-1",
        brand: "Hermes",
        productLine: "Birkin",
        modelName: "Birkin 25",
        tokens: ["tok-a", "tok-b"],
      },
    ]);
  });
});
