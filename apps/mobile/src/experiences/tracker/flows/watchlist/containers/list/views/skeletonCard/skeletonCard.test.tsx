import { render } from "@testing-library/react-native";
import { TrackerWatchlistListSkeletonCardView } from "./skeletonCard";

describe("TrackerWatchlistListSkeletonCardView", () => {
  it("renders a placeholder skeleton card", () => {
    const { getByTestId } = render(<TrackerWatchlistListSkeletonCardView />);
    expect(getByTestId("watchlist-skeleton-card")).toBeTruthy();
  });
});
