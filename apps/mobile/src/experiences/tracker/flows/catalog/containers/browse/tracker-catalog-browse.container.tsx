import { memo, Suspense } from "react";
import { TrackerCatalogBrowseModels } from "./models";
import {
  TrackerCatalogBrowseControllers,
  useTrackerCatalogBrowseControllers,
} from "./controllers";
import { TrackerCatalogBrowseViews } from "./views";
import { ContainerErrorBoundary } from "@/shared/components/container-error-boundary";

const ConnectedViews = memo(() => {
  const controllers = useTrackerCatalogBrowseControllers();
  return (
    <TrackerCatalogBrowseViews
      screenState={controllers.screenState}
      groups={controllers.groups}
      brands={controllers.brands}
      selectedBrand={controllers.selectedBrand}
      onBrandChange={controllers.onBrandChange}
      selectedUnitIds={controllers.selectedUnitIds}
      getGroupState={controllers.getGroupState}
      onToggleUnit={controllers.onToggleUnit}
      onToggleGroup={controllers.onToggleGroup}
      isRefreshing={controllers.isRefreshing}
      onRefresh={controllers.onRefresh}
    />
  );
});

ConnectedViews.displayName = "TrackerCatalogBrowseConnectedViews";

export const TrackerCatalogBrowseContainer = memo(() => {
  return (
    <ContainerErrorBoundary
      fallback={
        /* istanbul ignore next -- error boundary fallback */ () => (
          <TrackerCatalogBrowseViews screenState="error" />
        )
      }
    >
      <Suspense
        fallback={
          /* istanbul ignore next -- Suspense fallback (Figma 842:83) */ <TrackerCatalogBrowseViews screenState="loading" />
        }
      >
        <TrackerCatalogBrowseModels>
          <TrackerCatalogBrowseControllers>
            <ConnectedViews />
          </TrackerCatalogBrowseControllers>
        </TrackerCatalogBrowseModels>
      </Suspense>
    </ContainerErrorBoundary>
  );
});

TrackerCatalogBrowseContainer.displayName = "TrackerCatalogBrowseContainer";
