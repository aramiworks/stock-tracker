import type { WatchlistGroup } from "./tracker-watchlist-list.type";

/**
 * Storybook + offline fixture for the Shengsho-style watchlist.
 *
 * The controller resolves against the live `watchlist` GraphQL query landed by
 * INF-1415 (see `tracker-watchlist-list.controllers.tsx`). This fixture is
 * kept for Storybook stories + view-layer unit tests that don't want to spin
 * up an Apollo client. IDs are deterministic UUID-shaped strings so React
 * keys remain stable across hot reloads and snapshot diffs.
 */
export const WATCHLIST_LIST_MOCK_GROUPS: WatchlistGroup[] = [
  {
    brand: "Hermès",
    productLine: "Bolide",
    entries: [
      {
        id: "wl-bolide-27",
        watchableUnitId: "11111111-1111-1111-1111-000000000001",
        brand: "Hermès",
        productLine: "Bolide",
        modelName: "Bolide 27",
        state: "in_stock",
        // 35 minutes ago — "35분 전" relative-time bucket
        lastRestockedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      },
      {
        id: "wl-bolide-31",
        watchableUnitId: "11111111-1111-1111-1111-000000000002",
        brand: "Hermès",
        productLine: "Bolide",
        modelName: "Bolide 31",
        state: "out_of_stock",
        // 4 hours ago
        lastRestockedAt: new Date(
          Date.now() - 4 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ],
  },
  {
    brand: "Hermès",
    productLine: "Constance",
    entries: [
      {
        id: "wl-constance-18",
        watchableUnitId: "11111111-1111-1111-1111-000000000010",
        brand: "Hermès",
        productLine: "Constance",
        modelName: "Constance 18",
        state: "unknown",
        lastRestockedAt: null,
      },
    ],
  },
  {
    brand: "Cartier",
    productLine: "Tank Must",
    entries: [
      {
        id: "wl-tank-must-large-steel",
        watchableUnitId: "22222222-2222-2222-2222-000000000001",
        brand: "Cartier",
        productLine: "Tank Must",
        modelName: "Tank Must Large Steel",
        state: "in_stock",
        // 2 days ago
        lastRestockedAt: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ],
  },
];
