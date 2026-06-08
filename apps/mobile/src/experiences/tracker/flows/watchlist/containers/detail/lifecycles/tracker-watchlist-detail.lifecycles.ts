import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";
import { useRefetchOnRestock } from "@/shared/hooks/use-refetch-on-restock";

/**
 * Container-level lifecycle for `tracker/watchlist/detail`.
 *
 * Refetches the protected `watchlistDetail` GraphQL query (INF-1415) on focus
 * so the user always sees the latest state when they navigate back via the
 * stack, and also when a restock push arrives in the foreground (INF-1615).
 */
export const useTrackerWatchlistDetailLifecycle = (refetch: () => void) => {
  useRefetchOnFocus(refetch);
  useRefetchOnRestock(refetch);
};
