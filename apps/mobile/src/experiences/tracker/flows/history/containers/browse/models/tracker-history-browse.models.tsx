import { memo, type ReactNode } from "react";

interface TrackerHistoryBrowseModelsProps {
  children: ReactNode;
}

export const TrackerHistoryBrowseModels = memo<TrackerHistoryBrowseModelsProps>(
  ({ children }) => {
    return <>{children}</>;
  },
);

TrackerHistoryBrowseModels.displayName = "TrackerHistoryBrowseModels";
