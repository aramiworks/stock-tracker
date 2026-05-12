import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";

/**
 * Container-level lifecycle for `tracker/catalog/browse`.
 *
 * Refetches `catalog.list` whenever the screen regains focus — mirrors the
 * watchlist/list + history/browse pattern. Backend query is anonymous-allowed
 * at the router so this fires whether or not a JWT is present.
 */
export const useTrackerCatalogBrowseLifecycle = (refetch: () => void) => {
  useRefetchOnFocus(refetch);
};
