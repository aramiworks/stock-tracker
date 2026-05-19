// Shengsho-style alert-history contracts. Shape will match the protected
// `alertHistory` GraphQL query landed by INF-1479 — for INF-1478 the controller
// resolves against the in-memory fixture `ALERT_HISTORY_MOCK`. The mock is
// retained for Storybook + view-layer tests even after the backend wires up.

export type TrackerAlertHistoryBrowseScreenState =
  | "default"
  | "empty"
  | "loading"
  | "error";

/**
 * Drop-event kind. Aligned with the backend schema landing in INF-1479.
 *   restocked — scraper detected at least one SKU under the unit go from
 *               out-of-stock → in-stock since the last poll.
 *   soldOut   — scraper detected every SKU under the unit go from
 *               in-stock → out-of-stock since the last poll.
 */
export type AlertHistoryEventKind = "restocked" | "soldOut";

export type AlertHistoryEvent = {
  id: string;
  watchableUnitId: string;
  brand: string;
  productLine: string;
  modelName: string;
  kind: AlertHistoryEventKind;
  /** ISO 8601 timestamp. Displayed as `YYYY.MM.DD` (no relative formatting). */
  detectedAt: string;
};

export type TrackerAlertHistoryBrowseControllersOutput = {
  screenState: TrackerAlertHistoryBrowseScreenState;
  events: AlertHistoryEvent[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onEventPress: (event: AlertHistoryEvent) => void;
};
