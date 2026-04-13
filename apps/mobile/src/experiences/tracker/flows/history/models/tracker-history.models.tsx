import { memo, type ReactNode } from "react";

interface TrackerHistoryModelsProps {
  children: ReactNode;
}

export const TrackerHistoryModels = memo<TrackerHistoryModelsProps>(
  ({ children }) => {
    return <>{children}</>;
  },
);

TrackerHistoryModels.displayName = "TrackerHistoryModels";
