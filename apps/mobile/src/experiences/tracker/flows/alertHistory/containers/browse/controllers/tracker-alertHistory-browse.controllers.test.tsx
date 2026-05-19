import { render, act, fireEvent } from "@testing-library/react-native";
import { Text, Pressable } from "react-native";

jest.mock("../lifecycles/tracker-alertHistory-browse.lifecycles", () => ({
  useTrackerAlertHistoryBrowseLifecycle: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import {
  TrackerAlertHistoryBrowseControllers,
  useTrackerAlertHistoryBrowseControllers,
} from "./tracker-alertHistory-browse.controllers";
import { ALERT_HISTORY_MOCK } from "../models/tracker-alertHistory-browse.mock";

let captured: ReturnType<
  typeof useTrackerAlertHistoryBrowseControllers
> | null = null;

const Probe = () => {
  captured = useTrackerAlertHistoryBrowseControllers();
  return (
    <>
      <Text testID="screen-state">{captured.screenState}</Text>
      <Pressable
        testID="event-press"
        onPress={() => captured?.onEventPress(captured.events[0]!)}
      />
    </>
  );
};

const renderControllers = () =>
  render(
    <TrackerAlertHistoryBrowseControllers>
      <Probe />
    </TrackerAlertHistoryBrowseControllers>,
  );

describe("TrackerAlertHistoryBrowseControllers", () => {
  beforeEach(() => {
    captured = null;
    mockPush.mockClear();
  });

  it("exposes screenState=default with mock events sorted newest-first", () => {
    renderControllers();
    expect(captured?.screenState).toBe("default");
    expect(captured?.events.length).toBe(ALERT_HISTORY_MOCK.length);
    // Newest-first invariant: every successive detectedAt is <= previous.
    const ts = captured?.events.map((e) => new Date(e.detectedAt).getTime());
    for (let i = 1; i < (ts?.length ?? 0); i++) {
      expect(ts![i - 1]!).toBeGreaterThanOrEqual(ts![i]!);
    }
    expect(captured?.isRefreshing).toBe(false);
  });

  it("onEventPress navigates to /tracker/watchlist/[id] with the watchableUnitId param", () => {
    const { getByTestId } = renderControllers();
    fireEvent.press(getByTestId("event-press"));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/tracker/watchlist/[id]",
      params: { id: captured!.events[0]!.watchableUnitId },
    });
  });

  it("onRefresh triggers the no-op refetch and clears the refreshing flag", async () => {
    renderControllers();
    await act(async () => {
      captured?.onRefresh();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(captured?.isRefreshing).toBe(false);
  });
});
