import { render } from "@testing-library/react-native";
import { TrackerWatchlistDetailSkuRowView } from "./tracker-watchlist-detail-skuRow.view";
import type { DetailSku } from "../models/tracker-watchlist-detail.type";

const skuWithRef: DetailSku = {
  id: "sku-1",
  referenceCode: "WSTA0042",
  descriptor: "스틸 케이스 · 브라운 가죽",
  state: "in_stock",
};

const skuWithoutRef: DetailSku = {
  id: "sku-2",
  referenceCode: null,
  descriptor: "토고 · 골드 금장",
  state: "in_stock",
};

describe("TrackerWatchlistDetailSkuRowView", () => {
  it("renders the reference code when present", () => {
    const { getByTestId, getByText } = render(
      <TrackerWatchlistDetailSkuRowView sku={skuWithRef} />,
    );
    expect(getByTestId("watchlist-detail-sku-sku-1")).toBeTruthy();
    expect(getByText("WSTA0042")).toBeTruthy();
  });

  it("falls back to the Hermès source label when no reference code", () => {
    const { getByText } = render(
      <TrackerWatchlistDetailSkuRowView sku={skuWithoutRef} />,
    );
    expect(getByText("Hermès 공식")).toBeTruthy();
  });
});
