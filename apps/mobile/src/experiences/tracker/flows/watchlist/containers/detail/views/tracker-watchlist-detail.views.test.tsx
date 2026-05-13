import { render } from "@testing-library/react-native";
import { TrackerWatchlistDetailViews } from "./tracker-watchlist-detail.views";
import { WATCHLIST_DETAIL_MOCK } from "../models/tracker-watchlist-detail.mock";

const fullPayload = WATCHLIST_DETAIL_MOCK[
  "11111111-1111-1111-1111-000000000001"
]!;
const emptyHistoryPayload = WATCHLIST_DETAIL_MOCK[
  "22222222-2222-2222-2222-000000000001"
]!;

describe("TrackerWatchlistDetailViews", () => {
  it("renders default state with hero + SKUs + history when payload provided", () => {
    const { getByTestId } = render(
      <TrackerWatchlistDetailViews
        screenState="default"
        payload={fullPayload}
      />,
    );
    expect(getByTestId("watchlist-detail-screen")).toBeTruthy();
    expect(getByTestId("watchlist-detail-hero")).toBeTruthy();
    // first history row
    expect(
      getByTestId(`watchlist-detail-history-${fullPayload.dropEvents[0]!.id}`),
    ).toBeTruthy();
  });

  it("renders the history empty placeholder when dropEvents is empty", () => {
    const { getByTestId } = render(
      <TrackerWatchlistDetailViews
        screenState="default"
        payload={emptyHistoryPayload}
      />,
    );
    expect(getByTestId("watchlist-detail-history-empty")).toBeTruthy();
  });

  it("renders the error fallback when payload is missing on default state", () => {
    const { getByTestId } = render(
      <TrackerWatchlistDetailViews screenState="default" payload={null} />,
    );
    expect(getByTestId("watchlist-detail-error-state")).toBeTruthy();
  });

  it("renders the loading skeleton", () => {
    const { getByTestId } = render(
      <TrackerWatchlistDetailViews screenState="loading" />,
    );
    expect(getByTestId("watchlist-detail-skeleton")).toBeTruthy();
  });

  it("renders the error state", () => {
    const { getByTestId } = render(
      <TrackerWatchlistDetailViews screenState="error" />,
    );
    expect(getByTestId("watchlist-detail-error-state")).toBeTruthy();
  });

  it("defaults to screenState=default when omitted", () => {
    const { getByTestId } = render(
      <TrackerWatchlistDetailViews payload={fullPayload} />,
    );
    expect(getByTestId("watchlist-detail-screen")).toBeTruthy();
  });
});
