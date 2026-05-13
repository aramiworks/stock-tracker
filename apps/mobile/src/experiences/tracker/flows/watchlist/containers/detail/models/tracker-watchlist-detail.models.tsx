import { memo, type ReactNode } from "react";

interface TrackerWatchlistDetailModelsProps {
  children: ReactNode;
}

export const TrackerWatchlistDetailModels =
  memo<TrackerWatchlistDetailModelsProps>(({ children }) => {
    return <>{children}</>;
  });

TrackerWatchlistDetailModels.displayName = "TrackerWatchlistDetailModels";
