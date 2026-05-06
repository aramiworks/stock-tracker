import { memo, type ReactNode } from "react";

interface TrackerDashboardModelsProps {
  children: ReactNode;
}

export const TrackerDashboardModels = memo<TrackerDashboardModelsProps>(
  ({ children }) => {
    return <>{children}</>;
  },
);

TrackerDashboardModels.displayName = "TrackerDashboardModels";
