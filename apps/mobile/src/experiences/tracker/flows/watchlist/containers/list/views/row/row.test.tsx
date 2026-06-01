import { render, fireEvent } from "@testing-library/react-native";
import { TrackerWatchlistListRowView } from "./row";
import type { WatchlistEntry } from "../../models/tracker-watchlist-list.type";

const baseEntry: WatchlistEntry = {
  id: "wl-1",
  watchableUnitId: "unit-1",
  brand: "Hermès",
  productLine: "Bolide",
  modelName: "Bolide 27",
  state: "in_stock",
  lastRestockedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
};

describe("TrackerWatchlistListRowView", () => {
  it.each(["in_stock", "out_of_stock", "unknown"] as const)(
    "renders for state=%s",
    (state) => {
      const { getByTestId } = render(
        <TrackerWatchlistListRowView entry={{ ...baseEntry, state }} />,
      );
      expect(getByTestId("watchlist-row-unit-1")).toBeTruthy();
    },
  );

  it("renders without an onPress handler", () => {
    const { getByTestId } = render(
      <TrackerWatchlistListRowView entry={baseEntry} />,
    );
    fireEvent.press(getByTestId("watchlist-row-unit-1"));
    expect(getByTestId("watchlist-row-unit-1")).toBeTruthy();
  });

  it("invokes onPress with the entry when tapped", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <TrackerWatchlistListRowView entry={baseEntry} onPress={onPress} />,
    );
    fireEvent.press(getByTestId("watchlist-row-unit-1"));
    expect(onPress).toHaveBeenCalledWith(baseEntry);
  });

  it("renders with a null lastRestockedAt", () => {
    const { getByTestId } = render(
      <TrackerWatchlistListRowView
        entry={{ ...baseEntry, lastRestockedAt: null }}
      />,
    );
    expect(getByTestId("watchlist-row-unit-1")).toBeTruthy();
  });
});
