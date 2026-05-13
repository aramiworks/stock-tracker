import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";

/**
 * Container-level lifecycle for `tracker/watchlist/list`.
 *
 * Refetches `watchlist.list` whenever the screen regains focus — mirrors the
 * catalog/browse pattern. While the backend (INF-1415) is still pending the
 * refetch is a no-op against the mock data branch.
 */
export const useTrackerWatchlistListLifecycle = (refetch: () => void) => {
  useRefetchOnFocus(refetch);
};
