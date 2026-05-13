import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";

/**
 * Container-level lifecycle for `tracker/watchlist/detail`.
 *
 * Refetches the protected `watchlistDetail` GraphQL query (INF-1415) on focus
 * so the user always sees the latest state when they navigate back via the
 * stack.
 */
export const useTrackerWatchlistDetailLifecycle = (refetch: () => void) => {
  useRefetchOnFocus(refetch);
};
