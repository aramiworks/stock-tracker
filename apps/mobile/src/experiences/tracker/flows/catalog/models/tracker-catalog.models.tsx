import { memo, type ReactNode } from "react";

interface TrackerCatalogModelsProps {
  children: ReactNode;
}

export const TrackerCatalogModels = memo<TrackerCatalogModelsProps>(
  ({ children }) => {
    return <>{children}</>;
  },
);

TrackerCatalogModels.displayName = "TrackerCatalogModels";
