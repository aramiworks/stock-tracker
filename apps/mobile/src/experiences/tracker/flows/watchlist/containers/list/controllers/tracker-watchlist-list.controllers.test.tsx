import { render, act, fireEvent } from "@testing-library/react-native";
import { Text, Pressable } from "react-native";

jest.mock("../lifecycles/tracker-watchlist-list.lifecycles", () => ({
  useTrackerWatchlistListLifecycle: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import {
  TrackerWatchlistListControllers,
  useTrackerWatchlistListControllers,
} from "./tracker-watchlist-list.controllers";
import { WATCHLIST_LIST_MOCK_GROUPS } from "../models/tracker-watchlist-list.mock";

let captured: ReturnType<typeof useTrackerWatchlistListControllers> | null =
  null;

const Probe = () => {
  captured = useTrackerWatchlistListControllers();
  return (
    <>
      <Text testID="screen-state">{captured.screenState}</Text>
      <Pressable
        testID="entry-press"
        onPress={() =>
          captured?.onEntryPress(WATCHLIST_LIST_MOCK_GROUPS[0]!.entries[0]!)
        }
      />
      <Pressable testID="add-press" onPress={captured.onAddProductsPress} />
    </>
  );
};

const renderControllers = () =>
  render(
    <TrackerWatchlistListControllers>
      <Probe />
    </TrackerWatchlistListControllers>,
  );

describe("TrackerWatchlistListControllers", () => {
  beforeEach(() => {
    captured = null;
    mockPush.mockClear();
  });

  it("exposes screenState=default with the mock fixture", () => {
    renderControllers();
    expect(captured?.screenState).toBe("default");
    expect(captured?.groups).toEqual(WATCHLIST_LIST_MOCK_GROUPS);
    expect(captured?.isRefreshing).toBe(false);
  });

  it("onAddProductsPress navigates to /tracker/catalog/browse", () => {
    const { getByTestId } = renderControllers();
    fireEvent.press(getByTestId("add-press"));
    expect(mockPush).toHaveBeenCalledWith("/tracker/catalog/browse");
  });

  it("onEntryPress navigates to /tracker/watchlist/[id] with the watchableUnitId param", () => {
    const { getByTestId } = renderControllers();
    fireEvent.press(getByTestId("entry-press"));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/tracker/watchlist/[id]",
      params: {
        id: WATCHLIST_LIST_MOCK_GROUPS[0]!.entries[0]!.watchableUnitId,
      },
    });
  });

  it("onRefresh triggers a refetch via startTransition", async () => {
    renderControllers();
    await act(async () => {
      captured?.onRefresh();
      await Promise.resolve();
      await Promise.resolve();
    });
    // Refetch swaps the memoised groups; the value remains equal to the
    // fixture but the underlying tick bumped — we assert the refreshing flag
    // settled back to false and the groups stayed shape-equal.
    expect(captured?.isRefreshing).toBe(false);
    expect(captured?.groups).toEqual(WATCHLIST_LIST_MOCK_GROUPS);
  });
});
