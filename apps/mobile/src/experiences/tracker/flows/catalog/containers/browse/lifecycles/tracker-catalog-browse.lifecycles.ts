import { useEffect } from "react";

/**
 * Container-level lifecycle for `tracker/catalog/browse`.
 *
 * TODO(INF-1393): once the tRPC `catalog.list` query is wired via Apollo, pass
 * `refetch` and call `useRefetchOnFocus(refetch)` (matches the watchlist/list
 * + history/browse pattern).
 */
export const useTrackerCatalogBrowseLifecycle = () => {
  useEffect(() => {
    // no-op while running on mock data
  }, []);
};
