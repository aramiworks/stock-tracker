import { render } from "@testing-library/react-native";
import { TrackerWatchlistDetailHeroView } from "./hero";

describe("TrackerWatchlistDetailHeroView", () => {
  it("renders the eyebrow and model name", () => {
    const { getByTestId, getByText } = render(
      <TrackerWatchlistDetailHeroView
        brand="Hermès"
        productLine="Bolide"
        modelName="Bolide 27"
      />,
    );
    expect(getByTestId("watchlist-detail-hero")).toBeTruthy();
    expect(getByText("Bolide 27")).toBeTruthy();
  });
});
