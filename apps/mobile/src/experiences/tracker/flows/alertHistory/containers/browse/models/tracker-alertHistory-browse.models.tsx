import { memo, type ReactNode } from "react";

interface TrackerAlertHistoryBrowseModelsProps {
  children: ReactNode;
}

export const TrackerAlertHistoryBrowseModels =
  memo<TrackerAlertHistoryBrowseModelsProps>(({ children }) => {
    return <>{children}</>;
  });

TrackerAlertHistoryBrowseModels.displayName = "TrackerAlertHistoryBrowseModels";
