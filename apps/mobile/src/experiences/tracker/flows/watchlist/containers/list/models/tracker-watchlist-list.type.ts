// Shengsho-style watchlist contracts. Mirrors the tRPC `watchlist.list`
// shape introduced in INF-1415 (backend sub-issue). When that lands, swap
// `WATCHLIST_LIST_MOCK_GROUPS` for a `useSuspenseQuery` against the tracker
// subgraph and drop the type alias chain to a generated GraphQL type.

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
