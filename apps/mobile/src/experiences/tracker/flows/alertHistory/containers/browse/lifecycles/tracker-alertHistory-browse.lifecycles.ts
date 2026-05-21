import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";

/**
 * Container-level lifecycle for `tracker/alertHistory/browse`.
 *
 * Mirrors the watchlist/list pattern (INF-1414): refetches the source query
 * whenever the screen regains focus. The controller forwards the Apollo
 * `refetch` returned by `useSuspenseQuery(ALERT_HISTORY_QUERY)` (INF-1479).
 */
export const useTrackerAlertHistoryBrowseLifecycle = (refetch: () => void) => {
  useRefetchOnFocus(refetch);
};
