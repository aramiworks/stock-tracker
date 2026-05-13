import { render } from "@testing-library/react-native";
import { TrackerWatchlistListStatePillView } from "./tracker-watchlist-list-statePill.view";

describe("TrackerWatchlistListStatePillView", () => {
  it.each(["in_stock", "out_of_stock", "unknown"] as const)(
    "renders for state=%s with default testID",
    (state) => {
      const { getByTestId } = render(
        <TrackerWatchlistListStatePillView state={state} />,
      );
      expect(getByTestId(`watchlist-state-pill-${state}`)).toBeTruthy();
    },
  );

  it("honors a custom testID override", () => {
    const { getByTestId } = render(
      <TrackerWatchlistListStatePillView
        state="in_stock"
        testID="custom-pill"
      />,
    );
    expect(getByTestId("custom-pill")).toBeTruthy();
  });
});
