import { memo, type ReactNode } from "react";

interface TrackerWatchlistListModelsProps {
  children: ReactNode;
}

export const TrackerWatchlistListModels =
  memo<TrackerWatchlistListModelsProps>(({ children }) => {
    return <>{children}</>;
  });

TrackerWatchlistListModels.displayName = "TrackerWatchlistListModels";
