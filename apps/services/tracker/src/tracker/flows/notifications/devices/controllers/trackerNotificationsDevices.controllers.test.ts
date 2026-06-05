import { describe, it, expect, beforeEach } from "@jest/globals";
import { TrackerNotificationsDevicesControllers } from "./trackerNotificationsDevices.controllers.js";
import type { TrackerNotificationsDevicesModels } from "../models/trackerNotificationsDevices.models.js";

const USER_ID = "00000000-0000-0000-0000-000000000001";
const EXPO_TOKEN = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]";

function createMockModels(
  overrides: Partial<
    Record<keyof TrackerNotificationsDevicesModels, unknown>
  > = {},
) {
  return {
    registerDevice: async () => ({
      id: "device-1",
      auth_user_id: USER_ID,
      expo_token: EXPO_TOKEN,
      platform: "ios",
      active: true,
      last_seen_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    }),
    deactivateDevice: async () => ({ count: 1 }),
    ...overrides,
  } as unknown as TrackerNotificationsDevicesModels;
}

describe("TrackerNotificationsDevicesControllers", () => {
  let controller: TrackerNotificationsDevicesControllers;

  describe("register", () => {
    it("registers the device and returns { registered: true }", async () => {
      let registeredWith: unknown;
      controller = new TrackerNotificationsDevicesControllers(
        createMockModels({
          registerDevice: async (params: unknown) => {
            registeredWith = params;
            return {};
          },
        }),
      );

      const result = await controller.register(
        { expoToken: EXPO_TOKEN, platform: "ios" },
        USER_ID,
      );

      expect(result).toEqual({ registered: true });
      expect(registeredWith).toEqual({
        userId: USER_ID,
        expoToken: EXPO_TOKEN,
        platform: "ios",
      });
    });
  });

  describe("unregister", () => {
    beforeEach(() => {
      controller = new TrackerNotificationsDevicesControllers(
        createMockModels(),
      );
    });

    it("returns { unregistered: true } when a row was deactivated", async () => {
      const result = await controller.unregister(
        { expoToken: EXPO_TOKEN },
        USER_ID,
      );
      expect(result).toEqual({ unregistered: true });
    });

    it("returns { unregistered: false } when nothing matched", async () => {
      controller = new TrackerNotificationsDevicesControllers(
        createMockModels({ deactivateDevice: async () => ({ count: 0 }) }),
      );
      const result = await controller.unregister(
        { expoToken: EXPO_TOKEN },
        USER_ID,
      );
      expect(result).toEqual({ unregistered: false });
    });
  });
});
