const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/shared/hooks/use-refetch-on-restock", () => ({
  emitRestock: jest.fn(),
}));

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  getLastNotificationResponseAsync: jest.fn().mockResolvedValue(null),
  AndroidImportance: { HIGH: 4 },
}));

import { Platform } from "react-native";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import * as Notifications from "expo-notifications";
import { emitRestock } from "@/shared/hooks/use-refetch-on-restock";
import { useNotificationHandlers } from "./notifications-handlers.lifecycles";

const setNotificationHandler =
  Notifications.setNotificationHandler as jest.Mock;
const setNotificationChannelAsync =
  Notifications.setNotificationChannelAsync as jest.Mock;
const addReceived = Notifications.addNotificationReceivedListener as jest.Mock;
const addResponse =
  Notifications.addNotificationResponseReceivedListener as jest.Mock;
const getLastResponse =
  Notifications.getLastNotificationResponseAsync as jest.Mock;
const emitRestockMock = emitRestock as jest.Mock;

// Captured once at import time — beforeEach clears mock.calls afterwards.
const capturedHandleNotification = setNotificationHandler.mock.calls[0][0]
  .handleNotification as () => Promise<unknown>;

function responseWith(data: unknown) {
  return {
    notification: { request: { content: { data } } },
  } as unknown as Notifications.NotificationResponse;
}

const originalOS = Platform.OS;

beforeEach(() => {
  jest.clearAllMocks();
  getLastResponse.mockResolvedValue(null);
});

afterEach(() => {
  (Platform as { OS: string }).OS = originalOS;
});

describe("setNotificationHandler", () => {
  it("shows a foreground banner + list and sound, but no badge", async () => {
    await expect(capturedHandleNotification()).resolves.toEqual({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    });
  });
});

describe("useNotificationHandlers", () => {
  it("creates the Android default channel on Android", () => {
    (Platform as { OS: string }).OS = "android";

    renderHook(() => useNotificationHandlers());

    expect(setNotificationChannelAsync).toHaveBeenCalledWith("default", {
      name: "Restock alerts",
      importance: 4,
    });
  });

  it("does not create a channel on iOS", () => {
    (Platform as { OS: string }).OS = "ios";

    renderHook(() => useNotificationHandlers());

    expect(setNotificationChannelAsync).not.toHaveBeenCalled();
  });

  it("refetches open watchlist screens on a foreground receipt", () => {
    renderHook(() => useNotificationHandlers());

    const receivedCallback = addReceived.mock.calls[0][0];
    receivedCallback();

    expect(emitRestockMock).toHaveBeenCalledTimes(1);
  });

  it("deep-links to the watchable unit on a notification tap", () => {
    renderHook(() => useNotificationHandlers());

    const responseCallback = addResponse.mock.calls[0][0];
    responseCallback(responseWith({ watchableUnitId: "unit-1" }));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/tracker/watchlist/[id]",
      params: { id: "unit-1" },
    });
  });

  it("ignores a tap whose payload has no watchable unit id", () => {
    renderHook(() => useNotificationHandlers());

    const responseCallback = addResponse.mock.calls[0][0];
    responseCallback(responseWith({}));
    responseCallback(responseWith(undefined));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("deep-links on a cold-start tap", async () => {
    getLastResponse.mockResolvedValue(
      responseWith({ watchableUnitId: "unit-cold" }),
    );

    renderHook(() => useNotificationHandlers());

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/tracker/watchlist/[id]",
        params: { id: "unit-cold" },
      });
    });
  });

  it("does nothing on cold start when there is no launch notification", async () => {
    getLastResponse.mockResolvedValue(null);

    renderHook(() => useNotificationHandlers());

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("removes both listeners on unmount", () => {
    const receivedRemove = jest.fn();
    const responseRemove = jest.fn();
    addReceived.mockReturnValue({ remove: receivedRemove });
    addResponse.mockReturnValue({ remove: responseRemove });

    const { unmount } = renderHook(() => useNotificationHandlers());
    unmount();

    expect(receivedRemove).toHaveBeenCalledTimes(1);
    expect(responseRemove).toHaveBeenCalledTimes(1);
  });
});
