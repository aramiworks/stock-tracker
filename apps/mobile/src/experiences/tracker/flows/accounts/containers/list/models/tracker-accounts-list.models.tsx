import { memo, type ReactNode } from "react";

interface TrackerAccountsListModelsProps {
  children: ReactNode;
}

export const TrackerAccountsListModels = memo<TrackerAccountsListModelsProps>(
  ({ children }) => {
    return <>{children}</>;
  },
);

TrackerAccountsListModels.displayName = "TrackerAccountsListModels";
