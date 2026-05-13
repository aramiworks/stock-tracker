import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";

/**
 * Container-level lifecycle for `tracker/watchlist/detail`.
 *
 * Refetches `watchlist.detail` on focus so the user always sees the latest
 * state when they navigate back via the stack. Becomes the real Apollo
 * refetch once INF-1415 lands.
 */
export const useTrackerWatchlistDetailLifecycle = (refetch: () => void) => {
  useRefetchOnFocus(refetch);
};
