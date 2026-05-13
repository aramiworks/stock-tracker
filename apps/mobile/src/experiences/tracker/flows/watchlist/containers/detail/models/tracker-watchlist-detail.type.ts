import type {
  WatchableState,
  WatchlistEntry,
} from "../../list/models/tracker-watchlist-list.type";

export type TrackerWatchlistDetailScreenState = "default" | "loading" | "error";

/**
 * A scrape-observed SKU under a watchable unit. Each unit can have multiple
 * SKUs (e.g. Cartier Tank Must has 4 — see Figma 846-57).
 *
 * `referenceCode` is the brand's public SKU ID (e.g. "WSTA0042"); when the
 * brand exposes no public SKU IDs (Hermès) the field is `null` and the row
 * surfaces a source label instead.
 */
export type DetailSku = {
  id: string;
  referenceCode: string | null;
  descriptor: string;
  state: WatchableState;
};

export type DropEventKind = "restocked" | "out_of_stock";

export type DetailDropEvent = {
  id: string;
  kind: DropEventKind;
  skuDescriptor: string;
  occurredAt: string;
};

export type WatchlistDetailPayload = {
  entry: WatchlistEntry;
  skus: DetailSku[];
  dropEvents: DetailDropEvent[];
};

export type TrackerWatchlistDetailControllersOutput = {
  screenState: TrackerWatchlistDetailScreenState;
  payload: WatchlistDetailPayload | null;
  onBack: () => void;
};
