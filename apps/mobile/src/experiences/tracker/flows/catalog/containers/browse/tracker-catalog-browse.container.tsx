import { memo } from "react";
import { TrackerCatalogBrowseModels } from "./models";
import {
  TrackerCatalogBrowseControllers,
  useTrackerCatalogBrowseControllers,
} from "./controllers";
import { TrackerCatalogBrowseViews } from "./views";

const ConnectedViews = memo(() => {
  const controllers = useTrackerCatalogBrowseControllers();
  return (
    <TrackerCatalogBrowseViews
      screenState={controllers.screenState}
      groups={controllers.groups}
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
  // TODO(INF-1393): wrap in <QueryErrorBoundary> + <Suspense> once the tRPC
  // `catalog.list` query is wired (mirrors watchlist/list + history/browse).
  return (
    <TrackerCatalogBrowseModels>
      <TrackerCatalogBrowseControllers>
        <ConnectedViews />
      </TrackerCatalogBrowseControllers>
    </TrackerCatalogBrowseModels>
  );
});

TrackerCatalogBrowseContainer.displayName = "TrackerCatalogBrowseContainer";
