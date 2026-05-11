import { memo, type ReactNode } from "react";

interface TrackerCatalogBrowseModelsProps {
  children: ReactNode;
}

export const TrackerCatalogBrowseModels = memo<TrackerCatalogBrowseModelsProps>(
  ({ children }) => {
    return <>{children}</>;
  },
);

TrackerCatalogBrowseModels.displayName = "TrackerCatalogBrowseModels";
