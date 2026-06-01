import { memo, Suspense } from "react";
import { TrackerAlertHistoryBrowseModels } from "./models/tracker-alertHistory-browse.models";
import {
  TrackerAlertHistoryBrowseControllers,
  useTrackerAlertHistoryBrowseControllers,
} from "./controllers/tracker-alertHistory-browse.controllers";
import { TrackerAlertHistoryBrowseViews } from "./views";
import { ContainerErrorBoundary } from "@/shared/components/container-error-boundary";

const ConnectedViews = memo(() => {
  const controllers = useTrackerAlertHistoryBrowseControllers();
  return (
    <TrackerAlertHistoryBrowseViews
      screenState={controllers.screenState}
      events={controllers.events}
      isRefreshing={controllers.isRefreshing}
      onRefresh={controllers.onRefresh}
    />
  );
});

ConnectedViews.displayName = "TrackerAlertHistoryBrowseConnectedViews";

/**
 * Shengsho-style alert-history browse container.
 *
 * Mirrors the watchlist/list scaffold (INF-1414 — `tracker-watchlist-list.container.tsx`):
 *   ContainerErrorBoundary → Suspense → Models → Controllers → ConnectedViews
 *
 * The controller resolves against the live protected `alertHistory` GraphQL
 * query landed by INF-1479 (see
 * `controllers/tracker-alertHistory-browse.controllers.tsx`). The view-layer
 * `*.mock.ts` fixture is kept for Storybook + view tests.
 */
export const TrackerAlertHistoryBrowseContainer = memo(() => {
  return (
    <ContainerErrorBoundary
      fallback={
        /* istanbul ignore next -- error boundary fallback */ () => (
          <TrackerAlertHistoryBrowseViews screenState="error" />
        )
      }
    >
      <Suspense
        fallback={
          /* istanbul ignore next -- Suspense fallback */ <TrackerAlertHistoryBrowseViews screenState="loading" />
        }
      >
        <TrackerAlertHistoryBrowseModels>
          <TrackerAlertHistoryBrowseControllers>
            <ConnectedViews />
          </TrackerAlertHistoryBrowseControllers>
        </TrackerAlertHistoryBrowseModels>
      </Suspense>
    </ContainerErrorBoundary>
  );
});

TrackerAlertHistoryBrowseContainer.displayName =
  "TrackerAlertHistoryBrowseContainer";
