import { render, fireEvent } from "@testing-library/react-native";
import { TrackerWatchlistListEmptyStateView } from "./emptyState";

describe("TrackerWatchlistListEmptyStateView", () => {
  it("renders title + body with no CTA when onAddPress is omitted", () => {
    const { getByTestId, queryByTestId } = render(
      <TrackerWatchlistListEmptyStateView />,
    );
    expect(getByTestId("watchlist-empty-state")).toBeTruthy();
    expect(queryByTestId("watchlist-empty-cta")).toBeNull();
  });

  it("renders the CTA and invokes onAddPress when tapped", () => {
    const onAddPress = jest.fn();
    const { getByTestId } = render(
      <TrackerWatchlistListEmptyStateView onAddPress={onAddPress} />,
    );
    fireEvent.press(getByTestId("watchlist-empty-cta"));
    expect(onAddPress).toHaveBeenCalledTimes(1);
  });
});
