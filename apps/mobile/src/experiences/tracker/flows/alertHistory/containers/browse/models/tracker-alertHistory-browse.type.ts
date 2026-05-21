// Shengsho-style alert-history contracts. Shape mirrors the protected
// `alertHistory` GraphQL query landed by INF-1479. The view-layer `*.mock.ts`
// fixture is retained for Storybook + view-layer tests.

export type TrackerAlertHistoryBrowseScreenState =
  | "default"
  | "empty"
  | "loading"
  | "error";

/**
 * Drop-event kind. Aligned with the backend schema (INF-1479).
 *   restocked — scraper detected at least one SKU under the unit go from
 *               out-of-stock → in-stock since the last poll.
 *   soldOut   — scraper detected every SKU under the unit go from
 *               in-stock → out-of-stock since the last poll. Today the server
 *               always emits `restocked`; `soldOut` ships with the event
 *               source landing in INF-1483.
 */
export type AlertHistoryEventKind = "restocked" | "soldOut";

export type AlertHistoryEvent = {
  id: string;
  brand: string;
  productLine: string;
  modelName: string;
  /** "color · leather · hardware · size" — server-composed, optional. */
  skuDescriptor: string | null;
  kind: AlertHistoryEventKind;
  /** ISO 8601 timestamp. Displayed as `YYYY.MM.DD` (no relative formatting). */
  detectedAt: string;
};

export type TrackerAlertHistoryBrowseControllersOutput = {
  screenState: TrackerAlertHistoryBrowseScreenState;
  events: AlertHistoryEvent[];
  isRefreshing: boolean;
  onRefresh: () => void;
};
