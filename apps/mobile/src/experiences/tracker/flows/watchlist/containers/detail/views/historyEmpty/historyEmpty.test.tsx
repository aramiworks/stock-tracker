import { render } from "@testing-library/react-native";
import { TrackerWatchlistDetailHistoryEmptyView } from "./historyEmpty";

describe("TrackerWatchlistDetailHistoryEmptyView", () => {
  it("renders the empty placeholder", () => {
    const { getByTestId } = render(<TrackerWatchlistDetailHistoryEmptyView />);
    expect(getByTestId("watchlist-detail-history-empty")).toBeTruthy();
  });
});
