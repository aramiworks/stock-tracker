import { memo, Suspense } from "react";
import { TrackerWatchlistListModels } from "./models/tracker-watchlist-list.models";
import {
  TrackerWatchlistListControllers,
  useTrackerWatchlistListControllers,
} from "./controllers/tracker-watchlist-list.controllers";
import { TrackerWatchlistListViews } from "./views/tracker-watchlist-list.views";
import { QueryErrorBoundary } from "@/shared/components/query-error-boundary";

const ConnectedViews = memo(() => {
  const controllers = useTrackerWatchlistListControllers();
  return (
    <TrackerWatchlistListViews
      screenState={controllers.screenState}
      groups={controllers.groups}
      isRefreshing={controllers.isRefreshing}
      onRefresh={controllers.onRefresh}
      onAddProductsPress={controllers.onAddProductsPress}
      onEntryPress={controllers.onEntryPress}
    />
  );
});

ConnectedViews.displayName = "TrackerWatchlistListConnectedViews";

/**
 * Shengsho-style watchlist list container. Builds on the catalog/browse
 * scaffold from INF-1391 (PR #382) and replaces the legacy Cartier
 * `TrackerAccountsListContainer` at the route layer.
 *
 * Backend integration lives in INF-1415 — until that lands the controller
 * resolves against `WATCHLIST_LIST_MOCK_GROUPS`.
 */
export const TrackerWatchlistListContainer = memo(() => {
  return (
    <QueryErrorBoundary
      fallback={
        /* istanbul ignore next -- error boundary fallback */ () => (
          <TrackerWatchlistListViews screenState="error" />
        )
      }
    >
      <Suspense
        fallback={
          /* istanbul ignore next -- Suspense fallback */ <TrackerWatchlistListViews screenState="loading" />
        }
      >
        <TrackerWatchlistListModels>
          <TrackerWatchlistListControllers>
            <ConnectedViews />
          </TrackerWatchlistListControllers>
        </TrackerWatchlistListModels>
      </Suspense>
    </QueryErrorBoundary>
  );
});

TrackerWatchlistListContainer.displayName = "TrackerWatchlistListContainer";
