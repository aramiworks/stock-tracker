import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";

/**
 * Container-level lifecycle for `tracker/alertHistory/browse`.
 *
 * Mirrors the watchlist/list pattern (INF-1414): refetches the source query
 * whenever the screen regains focus. While INF-1478 is mock-resolved the
 * `refetch` argument is a no-op callback — once INF-1479 wires the live
 * `alertHistory` GraphQL query the controller will forward the Apollo
 * `refetch` here unchanged.
 */
export const useTrackerAlertHistoryBrowseLifecycle = (refetch: () => void) => {
  useRefetchOnFocus(refetch);
};
