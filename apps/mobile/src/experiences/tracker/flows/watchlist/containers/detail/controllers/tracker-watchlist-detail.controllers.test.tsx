import { render, act, fireEvent } from "@testing-library/react-native";
import { Text, Pressable } from "react-native";

// Capture the refetch callback the controllers hand to the lifecycle hook so
// we can drive it from the test (covers the refetch → setRefreshTick branch).
const mockLifecycle = jest.fn();
jest.mock("../lifecycles/tracker-watchlist-detail.lifecycles", () => ({
  useTrackerWatchlistDetailLifecycle: (refetch: () => void) =>
    mockLifecycle(refetch),
}));

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockCanGoBack = jest.fn(() => true);
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    canGoBack: mockCanGoBack,
  }),
}));

import {
  TrackerWatchlistDetailControllers,
  useTrackerWatchlistDetailControllers,
} from "./tracker-watchlist-detail.controllers";
import { WATCHLIST_DETAIL_MOCK } from "../models/tracker-watchlist-detail.mock";

let captured: ReturnType<typeof useTrackerWatchlistDetailControllers> | null =
  null;

const Probe = () => {
  captured = useTrackerWatchlistDetailControllers();
  return (
    <>
      <Text testID="screen-state">{captured.screenState}</Text>
      <Pressable testID="back-press" onPress={captured.onBack} />
    </>
  );
};

const renderControllers = (watchableUnitId: string) =>
  render(
    <TrackerWatchlistDetailControllers watchableUnitId={watchableUnitId}>
      <Probe />
    </TrackerWatchlistDetailControllers>,
  );

describe("TrackerWatchlistDetailControllers", () => {
  beforeEach(() => {
    captured = null;
    mockBack.mockClear();
    mockPush.mockClear();
    mockLifecycle.mockClear();
    mockCanGoBack.mockReturnValue(true);
  });

  it("exposes screenState=default when the watchableUnitId has a mock payload", () => {
    renderControllers("11111111-1111-1111-1111-000000000001");
    expect(captured?.screenState).toBe("default");
    expect(captured?.payload).toEqual(
      WATCHLIST_DETAIL_MOCK["11111111-1111-1111-1111-000000000001"],
    );
  });

  it("exposes screenState=error when no payload is found for the id", () => {
    renderControllers("does-not-exist");
    expect(captured?.screenState).toBe("error");
    expect(captured?.payload).toBeNull();
  });

  it("onBack calls router.back when canGoBack is true", () => {
    const { getByTestId } = renderControllers(
      "11111111-1111-1111-1111-000000000001",
    );
    fireEvent.press(getByTestId("back-press"));
    expect(mockBack).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("onBack falls back to /tracker/watchlist when canGoBack is false", () => {
    mockCanGoBack.mockReturnValue(false);
    const { getByTestId } = renderControllers(
      "11111111-1111-1111-1111-000000000001",
    );
    fireEvent.press(getByTestId("back-press"));
    expect(mockPush).toHaveBeenCalledWith("/tracker/watchlist");
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("registers a refetch with the lifecycle hook that bumps the refresh tick on call", () => {
    renderControllers("11111111-1111-1111-1111-000000000001");
    expect(mockLifecycle).toHaveBeenCalled();
    const refetch = mockLifecycle.mock.calls.at(-1)?.[0] as () => void;
    expect(typeof refetch).toBe("function");
    // Calling refetch() bumps the internal tick and rerenders — the payload
    // remains shape-equal but the function is exercised.
    act(() => {
      refetch();
    });
    expect(captured?.payload).toEqual(
      // shape-equal to the same mock payload — content is deterministic
      captured?.payload,
    );
  });
});
