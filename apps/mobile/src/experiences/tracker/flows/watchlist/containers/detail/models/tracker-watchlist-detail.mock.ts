import type { WatchlistDetailPayload } from "./tracker-watchlist-detail.type";

/**
 * Storybook + offline fixtures for the watchlist detail screen.
 *
 * Two canonical shapes — keyed by `watchableUnitId`:
 *   - Hermès Bolide 27 → single SKU, "Hermès 공식" source label, full history
 *   - Cartier Tank Must Large Steel → multi-SKU (4 SKUs), no history
 *
 * Once INF-1415's `watchlist.detail(watchableUnitId)` query lands, swap the
 * mock branch in the controller for `useSuspenseQuery`.
 */
export const WATCHLIST_DETAIL_MOCK: Record<string, WatchlistDetailPayload> = {
  "11111111-1111-1111-1111-000000000001": {
    entry: {
      id: "wl-bolide-27",
      watchableUnitId: "11111111-1111-1111-1111-000000000001",
      brand: "Hermès",
      productLine: "Bolide",
      modelName: "Bolide 27",
      state: "in_stock",
      lastRestockedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
    skus: [
      {
        id: "sku-bolide-27-togo-gold",
        referenceCode: null,
        descriptor: "토고 · 골드 금장",
        state: "in_stock",
      },
    ],
    dropEvents: [
      {
        id: "drop-1",
        kind: "restocked",
        skuDescriptor: "토고 · 골드 금장",
        occurredAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      },
      {
        id: "drop-2",
        kind: "out_of_stock",
        skuDescriptor: "토고 · 골드 금장",
        occurredAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "drop-3",
        kind: "restocked",
        skuDescriptor: "토고 · 골드 금장",
        occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  "22222222-2222-2222-2222-000000000001": {
    entry: {
      id: "wl-tank-must-large-steel",
      watchableUnitId: "22222222-2222-2222-2222-000000000001",
      brand: "Cartier",
      productLine: "Tank Must",
      modelName: "Tank Must Large Steel",
      state: "in_stock",
      lastRestockedAt: new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    skus: [
      {
        id: "sku-tm-large-steel-leather",
        referenceCode: "WSTA0042",
        descriptor: "스틸 케이스 · 브라운 가죽",
        state: "in_stock",
      },
      {
        id: "sku-tm-large-steel-black",
        referenceCode: "WSTA0043",
        descriptor: "스틸 케이스 · 블랙 가죽",
        state: "out_of_stock",
      },
      {
        id: "sku-tm-large-steel-bracelet",
        referenceCode: "WSTA0029",
        descriptor: "스틸 케이스 · 스틸 브레이슬릿",
        state: "in_stock",
      },
      {
        id: "sku-tm-large-steel-vintage",
        referenceCode: "WSTA0099",
        descriptor: "빈티지 다이얼",
        state: "unknown",
      },
    ],
    dropEvents: [],
  },
};
