// Mirrors the tRPC `catalog.list` contract from INF-1393.
// TODO(INF-1393): Replace mocks once tRPC + GraphQL subgraph land — see
// `apps/services/tracker` (catalog.list) and `apps/subgraphs/tracker`.

export type TrackerCatalogBrowseScreenState =
  | "default"
  | "empty"
  | "loading"
  | "error";

export type CatalogUnit = {
  id: string;
  brand: string;
  productLine: string;
  modelName: string;
};

export type CatalogGroup = {
  brand: string;
  productLine: string;
  units: CatalogUnit[];
};

/**
 * "all"  — every unit in the group is in the watchlist (checkbox shows "checked")
 * "some" — at least one but not every unit is in the watchlist (shows "indeterminate")
 * "none" — no unit in the group is in the watchlist (shows "unchecked")
 */
export type GroupSelectionState = "all" | "some" | "none";

export type TrackerCatalogBrowseControllersOutput = {
  screenState: TrackerCatalogBrowseScreenState;
  /** Groups for the currently selected brand only (already filtered). */
  groups: CatalogGroup[];
  /** Distinct brands across the whole catalog, in catalog sort order. */
  brands: string[];
  /** Brand currently shown (drives the segmented filter + `groups`). */
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  selectedUnitIds: ReadonlySet<string>;
  getGroupState: (group: CatalogGroup) => GroupSelectionState;
  onToggleUnit: (unitId: string) => Promise<void>;
  onToggleGroup: (group: CatalogGroup) => Promise<void>;
  isRefreshing: boolean;
  onRefresh: () => void;
};
