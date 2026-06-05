import { describe, expect, it, jest } from "@jest/globals";
import { TrackerNotificationsDevicesModels } from "./trackerNotificationsDevices.models.js";
import type { PrismaService } from "@stock-tracker/nestjs-common";

const USER_ID = "00000000-0000-0000-0000-000000000001";
const EXPO_TOKEN = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]";

function createModels() {
  const upsert = jest.fn(async (_args: unknown) => ({ id: "device-1" }));
  const updateMany = jest.fn(async (_args: unknown) => ({ count: 1 }));
  const prisma = {
    push_devices: { upsert, updateMany },
  } as unknown as PrismaService;
  return {
    models: new TrackerNotificationsDevicesModels(prisma),
    upsert,
    updateMany,
  };
}

describe("TrackerNotificationsDevicesModels.registerDevice", () => {
  it("upserts keyed on expo_token, reassigning user + reactivating on conflict", async () => {
    const { models, upsert } = createModels();

    await models.registerDevice({
      userId: USER_ID,
      expoToken: EXPO_TOKEN,
      platform: "ios",
    });

    const args = upsert.mock.calls[0]![0]! as {
      where: { expo_token: string };
      create: Record<string, unknown>;
      update: Record<string, unknown>;
    };
    expect(args.where).toEqual({ expo_token: EXPO_TOKEN });
    expect(args.create).toEqual({
      auth_user_id: USER_ID,
      expo_token: EXPO_TOKEN,
      platform: "ios",
    });
    expect(args.update).toMatchObject({
      auth_user_id: USER_ID,
      platform: "ios",
      active: true,
    });
    expect(args.update["last_seen_at"]).toBeInstanceOf(Date);
  });
});

describe("TrackerNotificationsDevicesModels.deactivateDevice", () => {
  it("deactivates only the caller's active row for the token", async () => {
    const { models, updateMany } = createModels();

    const result = await models.deactivateDevice({
      userId: USER_ID,
      expoToken: EXPO_TOKEN,
    });

    expect(result).toEqual({ count: 1 });
    const args = updateMany.mock.calls[0]![0]! as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    };
    expect(args.where).toEqual({
      expo_token: EXPO_TOKEN,
      auth_user_id: USER_ID,
      active: true,
    });
    expect(args.data).toEqual({ active: false });
  });
});
