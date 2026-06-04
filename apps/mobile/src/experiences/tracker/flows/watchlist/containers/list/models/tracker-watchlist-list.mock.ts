import type { WatchlistGroup } from "./tracker-watchlist-list.type";

/**
 * Storybook + offline fixture for the Shengsho-style watchlist.
 *
 * The controller resolves against the live `watchlist` GraphQL query landed by
 * INF-1415 (see `tracker-watchlist-list.controllers.tsx`). This fixture is
 * kept for Storybook stories + view-layer unit tests that don't want to spin
 * up an Apollo client. IDs are deterministic UUID-shaped strings so React
 * keys remain stable across hot reloads and snapshot diffs.
 *
 * Mirrors Figma default frame 845-2 exactly: three brand/productLine groups,
 * six entries, all three watchable states represented:
 *   - in_stock     (Bolide 27, Tank Must Small Leather)
 *   - out_of_stock (Bolide 31, Evelyne 29, Tank Must Large Steel)
 *   - unknown      (Evelyne 16 — scraper hasn't checked yet → "—")
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
        // ~35분 전 (35 minutes ago)
        lastRestockedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      },
      {
        id: "wl-bolide-31",
        watchableUnitId: "11111111-1111-1111-1111-000000000002",
        brand: "Hermès",
        productLine: "Bolide",
        modelName: "Bolide 31",
        state: "out_of_stock",
        // ~3일 전 (3 days ago)
        lastRestockedAt: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ],
  },
  {
    brand: "Hermès",
    productLine: "Evelyne",
    entries: [
      {
        id: "wl-evelyne-16",
        watchableUnitId: "11111111-1111-1111-1111-000000000020",
        brand: "Hermès",
        productLine: "Evelyne",
        modelName: "Evelyne 16",
        state: "unknown",
        // Scraper hasn't checked yet — renders "—" in the UI
        lastRestockedAt: null,
      },
      {
        id: "wl-evelyne-29",
        watchableUnitId: "11111111-1111-1111-1111-000000000021",
        brand: "Hermès",
        productLine: "Evelyne",
        modelName: "Evelyne 29",
        state: "out_of_stock",
        // ~1주 전 (1 week ago)
        lastRestockedAt: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
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
        state: "out_of_stock",
        // ~2주 전 (2 weeks ago)
        lastRestockedAt: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: "wl-tank-must-small-leather",
        watchableUnitId: "22222222-2222-2222-2222-000000000002",
        brand: "Cartier",
        productLine: "Tank Must",
        modelName: "Tank Must Small Leather",
        state: "in_stock",
        // ~1일 전 (1 day ago)
        lastRestockedAt: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ],
  },
];
