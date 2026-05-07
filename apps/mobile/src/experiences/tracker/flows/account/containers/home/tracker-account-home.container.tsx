import { memo, Suspense } from "react";
import { TrackerAccountHomeModels } from "./models";
import {
  TrackerAccountHomeControllers,
  useTrackerAccountHomeControllers,
} from "./controllers";
import { TrackerAccountHomeViews } from "./views";
import { QueryErrorBoundary } from "@/shared/components/query-error-boundary";

const ConnectedViews = memo(() => {
  const controllers = useTrackerAccountHomeControllers();
  return <TrackerAccountHomeViews {...controllers} />;
});

ConnectedViews.displayName = "TrackerAccountHomeConnectedViews";

export const TrackerAccountHomeContainer = memo(() => {
  return (
    <QueryErrorBoundary
      fallback={
        /* istanbul ignore next -- error boundary fallback */ ({ retry }) => (
          <TrackerAccountHomeViews screenState="error" onRetry={retry} />
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
    </QueryErrorBoundary>
  );
});

TrackerAccountHomeContainer.displayName = "TrackerAccountHomeContainer";
