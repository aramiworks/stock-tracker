// Shengsho-style watchlist contracts. Shape matches the protected `watchlist`
// GraphQL query landed by INF-1415 — see `apps/subgraphs/tracker/schema.graphql`
// (`WatchlistGroup` / `WatchlistEntry`). The mock fixture
// (`WATCHLIST_LIST_MOCK_GROUPS`) is retained for Storybook + view-layer tests
// that don't want to spin up an Apollo client.

export type TrackerWatchlistListScreenState =
  | "default"
  | "empty"
  | "loading"
  | "error";

/**
 * Restock state of a watchable unit.
 *   in_stock      — at least one SKU under the unit is in stock
 *   out_of_stock  — every SKU under the unit is out of stock
 *   unknown       — scraper hasn't checked yet (initial state)
 */
export type WatchableState = "in_stock" | "out_of_stock" | "unknown";

export type WatchlistEntry = {
  id: string;
  watchableUnitId: string;
  brand: string;
  productLine: string;
  modelName: string;
  state: WatchableState;
  lastRestockedAt: string | null;
};

export type WatchlistGroup = {
  brand: string;
  productLine: string;
  entries: WatchlistEntry[];
};

export type TrackerWatchlistListControllersOutput = {
  screenState: TrackerWatchlistListScreenState;
  groups: WatchlistGroup[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onAddProductsPress: () => void;
  onEntryPress: (entry: WatchlistEntry) => void;
};
