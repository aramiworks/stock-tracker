let mockIsDevice = true;
let mockProjectId: string | undefined = "test-project-id";

jest.mock("expo-device", () => ({
  get isDevice() {
    return mockIsDevice;
  },
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return { extra: { eas: { projectId: mockProjectId } } };
    },
  },
}));

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}));

jest.mock("@/lib/apollo/provider", () => ({
  apolloClient: { mutate: jest.fn().mockResolvedValue({ data: {} }) },
}));

import * as Notifications from "expo-notifications";
import { apolloClient } from "@/lib/apollo/provider";
import {
  registerForPushNotifications,
  unregisterFromPushNotifications,
} from "./notifications.lifecycles";

const getPermissionsAsync = Notifications.getPermissionsAsync as jest.Mock;
const requestPermissionsAsync =
  Notifications.requestPermissionsAsync as jest.Mock;
const getExpoPushTokenAsync = Notifications.getExpoPushTokenAsync as jest.Mock;
const mutate = apolloClient.mutate as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockIsDevice = true;
  mockProjectId = "test-project-id";
  getPermissionsAsync.mockResolvedValue({ status: "granted" });
  requestPermissionsAsync.mockResolvedValue({ status: "granted" });
  getExpoPushTokenAsync.mockResolvedValue({ data: "ExponentPushToken[abc]" });
});

describe("registerForPushNotifications", () => {
  it("returns null and registers nothing on a simulator", async () => {
    mockIsDevice = false;

    const result = await registerForPushNotifications();

    expect(result).toBeNull();
    expect(getPermissionsAsync).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("registers the token without prompting when permission is already granted", async () => {
    getPermissionsAsync.mockResolvedValue({ status: "granted" });

    const result = await registerForPushNotifications();

    expect(requestPermissionsAsync).not.toHaveBeenCalled();
    expect(getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: "test-project-id",
    });
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          expoToken: "ExponentPushToken[abc]",
        }),
      }),
    );
    expect(result).toBe("ExponentPushToken[abc]");
  });

  it("requests permission when not yet granted, then registers", async () => {
    getPermissionsAsync.mockResolvedValue({ status: "undetermined" });
    requestPermissionsAsync.mockResolvedValue({ status: "granted" });

    const result = await registerForPushNotifications();

    expect(requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(result).toBe("ExponentPushToken[abc]");
  });

  it("silently skips when the user denies the permission prompt", async () => {
    getPermissionsAsync.mockResolvedValue({ status: "undetermined" });
    requestPermissionsAsync.mockResolvedValue({ status: "denied" });

    const result = await registerForPushNotifications();

    expect(result).toBeNull();
    expect(getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("returns null when no EAS project id is configured", async () => {
    mockProjectId = undefined;

    const result = await registerForPushNotifications();

    expect(result).toBeNull();
    expect(getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
  });
});

describe("unregisterFromPushNotifications", () => {
  it("does nothing on a simulator", async () => {
    mockIsDevice = false;

    await unregisterFromPushNotifications();

    expect(getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("does nothing when no EAS project id is configured", async () => {
    mockProjectId = undefined;

    await unregisterFromPushNotifications();

    expect(getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("deactivates the device token with the unregister mutation", async () => {
    await unregisterFromPushNotifications();

    expect(getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: "test-project-id",
    });
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { expoToken: "ExponentPushToken[abc]" },
      }),
    );
  });
});
