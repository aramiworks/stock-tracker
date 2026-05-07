import { memo, type ReactNode } from "react";

interface TrackerAccountHomeModelsProps {
  children: ReactNode;
}

export const TrackerAccountHomeModels = memo<TrackerAccountHomeModelsProps>(
  ({ children }) => {
    return <>{children}</>;
  },
);

TrackerAccountHomeModels.displayName = "TrackerAccountHomeModels";
