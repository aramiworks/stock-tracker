import { memo, Suspense } from "react";
import { TrackerAlertHistoryBrowseModels } from "./models/tracker-alertHistory-browse.models";
import {
  TrackerAlertHistoryBrowseControllers,
  useTrackerAlertHistoryBrowseControllers,
} from "./controllers/tracker-alertHistory-browse.controllers";
import { TrackerAlertHistoryBrowseViews } from "./views/tracker-alertHistory-browse.views";
import { QueryErrorBoundary } from "@/shared/components/query-error-boundary";

const ConnectedViews = memo(() => {
  const controllers = useTrackerAlertHistoryBrowseControllers();
  return (
    <TrackerAlertHistoryBrowseViews
      screenState={controllers.screenState}
      events={controllers.events}
      isRefreshing={controllers.isRefreshing}
      onRefresh={controllers.onRefresh}
      onEventPress={controllers.onEventPress}
    />
  );
});

ConnectedViews.displayName = "TrackerAlertHistoryBrowseConnectedViews";

/**
 * Shengsho-style alert-history browse container.
 *
 * Mirrors the watchlist/list scaffold (INF-1414 — `tracker-watchlist-list.container.tsx`):
 *   QueryErrorBoundary → Suspense → Models → Controllers → ConnectedViews
 *
 * The controller currently resolves against the in-memory `ALERT_HISTORY_MOCK`
 * fixture; once INF-1479 lands the protected `alertHistory` GraphQL query the
 * follow-up agent will swap the source in `controllers/tracker-alertHistory-browse.controllers.tsx`
 * for `useSuspenseQuery(ALERT_HISTORY_QUERY)`. The error + Suspense boundaries
 * are wired up now so the swap is non-breaking.
 */
export const TrackerAlertHistoryBrowseContainer = memo(() => {
  return (
    <QueryErrorBoundary
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
    </QueryErrorBoundary>
  );
});

TrackerAlertHistoryBrowseContainer.displayName =
  "TrackerAlertHistoryBrowseContainer";
