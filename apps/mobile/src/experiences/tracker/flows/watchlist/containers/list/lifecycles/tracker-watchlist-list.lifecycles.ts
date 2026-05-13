import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";

/**
 * Container-level lifecycle for `tracker/watchlist/list`.
 *
 * Refetches the protected `watchlist` GraphQL query (INF-1415) whenever the
 * screen regains focus — mirrors the catalog/browse pattern.
 */
export const useTrackerWatchlistListLifecycle = (refetch: () => void) => {
  useRefetchOnFocus(refetch);
};
