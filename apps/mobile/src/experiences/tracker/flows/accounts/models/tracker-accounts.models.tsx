import { memo, type ReactNode } from "react";

interface TrackerAccountsModelsProps {
  children: ReactNode;
}

export const TrackerAccountsModels = memo<TrackerAccountsModelsProps>(
  ({ children }) => {
    return <>{children}</>;
  },
);

TrackerAccountsModels.displayName = "TrackerAccountsModels";
