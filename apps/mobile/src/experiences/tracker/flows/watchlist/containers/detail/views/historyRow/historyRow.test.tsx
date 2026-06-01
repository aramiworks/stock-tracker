import { render } from "@testing-library/react-native";
import { TrackerWatchlistDetailHistoryRowView } from "./historyRow";
import type { DetailDropEvent } from "../../models/tracker-watchlist-detail.type";

const base: DetailDropEvent = {
  id: "drop-1",
  kind: "restocked",
  skuDescriptor: "토고 · 골드 금장",
  occurredAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
};

describe("TrackerWatchlistDetailHistoryRowView", () => {
  it.each(["restocked", "out_of_stock"] as const)(
    "renders for kind=%s",
    (kind) => {
      const { getByTestId } = render(
        <TrackerWatchlistDetailHistoryRowView event={{ ...base, kind }} />,
      );
      expect(getByTestId("watchlist-detail-history-drop-1")).toBeTruthy();
    },
  );
});
