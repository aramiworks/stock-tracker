import { memo } from "react";
import { TrackerCatalogModels } from "./models";
import { TrackerCatalogControllers } from "./controllers";
import { TrackerCatalogViews } from "./views";

export const TrackerCatalogFlow = memo(() => {
  return (
    <TrackerCatalogModels>
      <TrackerCatalogControllers>
        <TrackerCatalogViews />
      </TrackerCatalogControllers>
    </TrackerCatalogModels>
  );
});

TrackerCatalogFlow.displayName = "TrackerCatalogFlow";
