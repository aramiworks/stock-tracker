import { memo, Suspense } from "react";
import { TrackerWatchlistDetailModels } from "./models/tracker-watchlist-detail.models";
import {
  TrackerWatchlistDetailControllers,
  useTrackerWatchlistDetailControllers,
} from "./controllers/tracker-watchlist-detail.controllers";
import { TrackerWatchlistDetailViews } from "./views/tracker-watchlist-detail.views";
import { QueryErrorBoundary } from "@/shared/components/query-error-boundary";

const ConnectedViews = memo(() => {
  const controllers = useTrackerWatchlistDetailControllers();
  return (
    <TrackerWatchlistDetailViews
      screenState={controllers.screenState}
      payload={controllers.payload}
      onBack={controllers.onBack}
    />
  );
});

ConnectedViews.displayName = "TrackerWatchlistDetailConnectedViews";

type Props = {
  watchableUnitId: string;
};

/**
 * Shengsho-style watchlist detail container.
 *
 * Stack-pushed from the list container on row tap. Resolves against the
 * protected `watchlistDetail(watchableUnitId)` GraphQL query landed by
 * INF-1415. `WATCHLIST_DETAIL_MOCK` is retained for Storybook + view-layer
 * unit tests.
 */
export const TrackerWatchlistDetailContainer = memo<Props>(
  ({ watchableUnitId }) => {
    return (
      <QueryErrorBoundary
        fallback={
          /* istanbul ignore next -- error boundary fallback */ () => (
            <TrackerWatchlistDetailViews screenState="error" />
          )
        }
      >
        <Suspense
          fallback={
            /* istanbul ignore next -- Suspense fallback */ <TrackerWatchlistDetailViews screenState="loading" />
          }
        >
          <TrackerWatchlistDetailModels>
            <TrackerWatchlistDetailControllers
              watchableUnitId={watchableUnitId}
            >
              <ConnectedViews />
            </TrackerWatchlistDetailControllers>
          </TrackerWatchlistDetailModels>
        </Suspense>
      </QueryErrorBoundary>
    );
  },
);

TrackerWatchlistDetailContainer.displayName = "TrackerWatchlistDetailContainer";
