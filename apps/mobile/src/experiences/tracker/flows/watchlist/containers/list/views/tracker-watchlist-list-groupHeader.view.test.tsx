import { render } from "@testing-library/react-native";
import { TrackerWatchlistListGroupHeaderView } from "./tracker-watchlist-list-groupHeader.view";

describe("TrackerWatchlistListGroupHeaderView", () => {
  it("renders brand and product-line labels", () => {
    const { getByTestId, getByText } = render(
      <TrackerWatchlistListGroupHeaderView
        brand="Hermès"
        productLine="Bolide"
      />,
    );
    expect(getByTestId("watchlist-group-Hermès-Bolide")).toBeTruthy();
    expect(getByText("Hermès")).toBeTruthy();
    expect(getByText("Bolide")).toBeTruthy();
  });
});
