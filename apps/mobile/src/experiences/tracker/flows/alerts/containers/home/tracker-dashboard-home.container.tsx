import { memo, Suspense } from "react";
import { TrackerDashboardHomeModels } from "./models";
import {
  TrackerDashboardHomeControllers,
  useTrackerDashboardHomeControllers,
} from "./controllers";
import { TrackerDashboardHomeViews } from "./views";
import { ContainerErrorBoundary } from "@/shared/components/container-error-boundary";

const ConnectedViews = memo(() => {
  const controllers = useTrackerDashboardHomeControllers();
  return <TrackerDashboardHomeViews {...controllers} />;
});

ConnectedViews.displayName = "TrackerDashboardHomeConnectedViews";

export const TrackerDashboardHomeContainer = memo(() => {
  return (
    <ContainerErrorBoundary
      fallback={
        /* istanbul ignore next -- error boundary fallback */ ({ retry }) => (
          <TrackerDashboardHomeViews screenState="error" onRetry={retry} />
        )
      }
    >
      <Suspense
        fallback={
          /* istanbul ignore next -- Suspense fallback */ <TrackerDashboardHomeViews screenState="loading" />
        }
      >
        <TrackerDashboardHomeModels>
          <TrackerDashboardHomeControllers>
            <ConnectedViews />
          </TrackerDashboardHomeControllers>
        </TrackerDashboardHomeModels>
      </Suspense>
    </ContainerErrorBoundary>
  );
});

TrackerDashboardHomeContainer.displayName = "TrackerDashboardHomeContainer";
