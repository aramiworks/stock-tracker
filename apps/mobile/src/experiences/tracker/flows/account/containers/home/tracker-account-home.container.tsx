import { memo, Suspense } from "react";
import { TrackerAccountHomeModels } from "./models";
import {
  TrackerAccountHomeControllers,
  useTrackerAccountHomeControllers,
} from "./controllers";
import { TrackerAccountHomeViews } from "./views";
import { ContainerErrorBoundary } from "@/shared/components/container-error-boundary";

const ConnectedViews = memo(() => {
  const controllers = useTrackerAccountHomeControllers();
  return <TrackerAccountHomeViews {...controllers} />;
});

ConnectedViews.displayName = "TrackerAccountHomeConnectedViews";

export const TrackerAccountHomeContainer = memo(() => {
  return (
    <ContainerErrorBoundary
      fallback={
        /* istanbul ignore next -- error boundary fallback */ ({ retry }) => (
          <TrackerAccountHomeViews />
        )
      }
    >
      <Suspense
        fallback={
          /* istanbul ignore next -- Suspense fallback */ <TrackerAccountHomeViews />
        }
      >
        <TrackerAccountHomeModels>
          <TrackerAccountHomeControllers>
            <ConnectedViews />
          </TrackerAccountHomeControllers>
        </TrackerAccountHomeModels>
      </Suspense>
    </ContainerErrorBoundary>
  );
});

TrackerAccountHomeContainer.displayName = "TrackerAccountHomeContainer";
