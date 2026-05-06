import { memo, type ReactNode } from "react";

interface TrackerAccountsDetailModelsProps {
  children: ReactNode;
}

export const TrackerAccountsDetailModels =
  memo<TrackerAccountsDetailModelsProps>(({ children }) => {
    return <>{children}</>;
  });

TrackerAccountsDetailModels.displayName = "TrackerAccountsDetailModels";
