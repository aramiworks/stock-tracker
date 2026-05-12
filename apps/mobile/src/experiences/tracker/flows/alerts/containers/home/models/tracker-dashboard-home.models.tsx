import { memo, type ReactNode } from "react";

interface TrackerDashboardHomeModelsProps {
  children: ReactNode;
}

export const TrackerDashboardHomeModels = memo<TrackerDashboardHomeModelsProps>(
  ({ children }) => {
    return <>{children}</>;
  },
);

TrackerDashboardHomeModels.displayName = "TrackerDashboardHomeModels";
