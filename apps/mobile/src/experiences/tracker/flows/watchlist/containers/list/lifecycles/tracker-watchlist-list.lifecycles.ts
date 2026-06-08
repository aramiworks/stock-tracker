import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";
import { useRefetchOnRestock } from "@/shared/hooks/use-refetch-on-restock";

/**
 * Container-level lifecycle for `tracker/watchlist/list`.
 *
 * Refetches the protected `watchlist` GraphQL query (INF-1415) whenever the
 * screen regains focus — mirrors the catalog/browse pattern — and also when a
 * restock push arrives in the foreground (INF-1615), so the list flips to
 * 재입고됨 live.
 */
export const useTrackerWatchlistListLifecycle = (refetch: () => void) => {
  useRefetchOnFocus(refetch);
  useRefetchOnRestock(refetch);
};
