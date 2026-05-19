import { render, act, fireEvent } from "@testing-library/react-native";
import { Text, Pressable } from "react-native";

const mockRefetch = jest.fn().mockResolvedValue(undefined);

jest.mock("@apollo/client/react", () => ({
  useSuspenseQuery: jest.fn(),
}));

jest.mock("../lifecycles/tracker-watchlist-list.lifecycles", () => ({
  useTrackerWatchlistListLifecycle: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { useSuspenseQuery } from "@apollo/client/react";
import {
  TrackerWatchlistListControllers,
  useTrackerWatchlistListControllers,
} from "./tracker-watchlist-list.controllers";
import { WATCHLIST_LIST_MOCK_GROUPS } from "../models/tracker-watchlist-list.mock";

const mockedUseSuspenseQuery = useSuspenseQuery as jest.MockedFunction<
  typeof useSuspenseQuery
>;

function setQueryData(
  groups: typeof WATCHLIST_LIST_MOCK_GROUPS = WATCHLIST_LIST_MOCK_GROUPS,
) {
  mockedUseSuspenseQuery.mockReturnValue({
    data: { watchlist: groups },
    refetch: mockRefetch,
    // The rest of the useSuspenseQuery return is unused by the controllers — cast wide.
  } as unknown as ReturnType<typeof useSuspenseQuery>);
}

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
    mockRefetch.mockClear();
    mockedUseSuspenseQuery.mockReset();
    setQueryData();
  });

  it("exposes screenState=default when watchlist.list returns groups", () => {
    renderControllers();
    expect(captured?.screenState).toBe("default");
    expect(captured?.groups).toEqual(WATCHLIST_LIST_MOCK_GROUPS);
    expect(captured?.isRefreshing).toBe(false);
  });

  it("exposes screenState=empty when watchlist.list returns no groups", () => {
    setQueryData([]);
    renderControllers();
    expect(captured?.screenState).toBe("empty");
    expect(captured?.groups).toEqual([]);
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

  it("onRefresh triggers refetch via startTransition and clears the refreshing flag", async () => {
    renderControllers();
    await act(async () => {
      captured?.onRefresh();
      // Flush microtasks so the startTransition-scheduled state update lands
      // and the refetch promise resolves before assertions.
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockRefetch).toHaveBeenCalled();
    expect(captured?.isRefreshing).toBe(false);
  });
});
