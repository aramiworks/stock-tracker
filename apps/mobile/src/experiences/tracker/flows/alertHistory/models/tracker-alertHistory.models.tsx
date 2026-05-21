import { memo, type ReactNode } from "react";

interface TrackerAlertHistoryModelsProps {
  children: ReactNode;
}

export const TrackerAlertHistoryModels = memo<TrackerAlertHistoryModelsProps>(
  ({ children }) => {
    return <>{children}</>;
  },
);

TrackerAlertHistoryModels.displayName = "TrackerAlertHistoryModels";
