import { memo, Suspense } from "react";
import { TrackerDashboardHomeModels } from "./models";
import {
  TrackerDashboardHomeControllers,
  useTrackerDashboardHomeControllers,
} from "./controllers";
import { TrackerDashboardHomeViews } from "./views";
import { QueryErrorBoundary } from "@/shared/components/query-error-boundary";

const ConnectedViews = memo(() => {
  const controllers = useTrackerDashboardHomeControllers();
  return <TrackerDashboardHomeViews {...controllers} />;
});

ConnectedViews.displayName = "TrackerDashboardHomeConnectedViews";

export const TrackerDashboardHomeContainer = memo(() => {
  return (
    <QueryErrorBoundary
      fallback={/* istanbul ignore next -- error boundary fallback */ ({ retry }) => (
        <TrackerDashboardHomeViews screenState="error" onRetry={retry} />
      )}
    >
      <Suspense fallback={/* istanbul ignore next -- Suspense fallback */ <TrackerDashboardHomeViews screenState="loading" />}>
        <TrackerDashboardHomeModels>
          <TrackerDashboardHomeControllers>
            <ConnectedViews />
          </TrackerDashboardHomeControllers>
        </TrackerDashboardHomeModels>
      </Suspense>
    </QueryErrorBoundary>
  );
});

TrackerDashboardHomeContainer.displayName = "TrackerDashboardHomeContainer";
