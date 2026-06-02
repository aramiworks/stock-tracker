import { render } from "@testing-library/react-native";
import { TrackerWatchlistDetailSkeletonCardView } from "./tracker-watchlist-detail-skeletonCard.view";

describe("TrackerWatchlistDetailSkeletonCardView", () => {
  it("renders the detail skeleton placeholder", () => {
    const { getByTestId } = render(<TrackerWatchlistDetailSkeletonCardView />);
    expect(getByTestId("watchlist-detail-skeleton")).toBeTruthy();
  });
});
