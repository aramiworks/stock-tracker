import { render, fireEvent } from "@testing-library/react-native";
import { TrackerWatchlistListViews } from "./tracker-watchlist-list.views";
import type { WatchlistGroup } from "../models/tracker-watchlist-list.type";

const sampleGroups: WatchlistGroup[] = [
  {
    brand: "Hermès",
    productLine: "Bolide",
    entries: [
      {
        id: "wl-1",
        watchableUnitId: "unit-1",
        brand: "Hermès",
        productLine: "Bolide",
        modelName: "Bolide 27",
        state: "in_stock",
        lastRestockedAt: null,
      },
    ],
  },
];

describe("TrackerWatchlistListViews", () => {
  it("renders default state with the storybook fixture when no props passed", () => {
    const { getByTestId } = render(<TrackerWatchlistListViews />);
    expect(getByTestId("watchlist-list-screen")).toBeTruthy();
  });

  it("renders default state with provided groups and forwards entry press", () => {
    const onEntryPress = jest.fn();
    const { getByTestId } = render(
      <TrackerWatchlistListViews
        screenState="default"
        groups={sampleGroups}
        onEntryPress={onEntryPress}
      />,
    );
    expect(getByTestId("watchlist-group-Hermès-Bolide")).toBeTruthy();
    fireEvent.press(getByTestId("watchlist-row-unit-1"));
    expect(onEntryPress).toHaveBeenCalledWith(sampleGroups[0]!.entries[0]);
  });

  it("renders the '+ 추가' header action when onAddProductsPress is provided", () => {
    const onAddProductsPress = jest.fn();
    const { getByTestId } = render(
      <TrackerWatchlistListViews
        screenState="default"
        groups={sampleGroups}
        onAddProductsPress={onAddProductsPress}
      />,
    );
    const btn = getByTestId("watchlist-add-products-button");
    fireEvent.press(btn);
    expect(onAddProductsPress).toHaveBeenCalledTimes(1);
  });

  it("hides the '+ 추가' header action when onAddProductsPress is absent", () => {
    const { queryByTestId } = render(
      <TrackerWatchlistListViews
        screenState="default"
        groups={sampleGroups}
      />,
    );
    expect(queryByTestId("watchlist-add-products-button")).toBeNull();
  });

  it("renders empty state with CTA forwarded to onAddProductsPress", () => {
    const onAddProductsPress = jest.fn();
    const { getByTestId } = render(
      <TrackerWatchlistListViews
        screenState="empty"
        onAddProductsPress={onAddProductsPress}
      />,
    );
    expect(getByTestId("watchlist-empty-state")).toBeTruthy();
    fireEvent.press(getByTestId("watchlist-empty-cta"));
    expect(onAddProductsPress).toHaveBeenCalledTimes(1);
  });

  it("renders error state as empty state (shares fallback view)", () => {
    const { getByTestId } = render(
      <TrackerWatchlistListViews screenState="error" />,
    );
    expect(getByTestId("watchlist-empty-state")).toBeTruthy();
  });

  it("renders loading skeletons", () => {
    const { getAllByTestId } = render(
      <TrackerWatchlistListViews screenState="loading" />,
    );
    expect(getAllByTestId("watchlist-skeleton-card").length).toBeGreaterThan(0);
  });

  it("wires the RefreshControl via onRefresh", () => {
    const onRefresh = jest.fn();
    render(
      <TrackerWatchlistListViews
        screenState="default"
        groups={sampleGroups}
        isRefreshing
        onRefresh={onRefresh}
      />,
    );
    // RefreshControl rendering smoke — assertion is that no throw occurs.
    expect(onRefresh).not.toHaveBeenCalled();
  });
});
