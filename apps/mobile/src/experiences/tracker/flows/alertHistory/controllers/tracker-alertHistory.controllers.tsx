import { memo, type ReactNode } from "react";

interface TrackerAlertHistoryControllersProps {
  children: ReactNode;
}

/**
 * Flow-level pass-through controllers. The browse container owns its own
 * controllers under `containers/browse/controllers/` and supplies them via a
 * local context — see `tracker-alertHistory-browse.controllers.tsx`.
 */
export const TrackerAlertHistoryControllers =
  memo<TrackerAlertHistoryControllersProps>(({ children }) => {
    return <>{children}</>;
  });

TrackerAlertHistoryControllers.displayName = "TrackerAlertHistoryControllers";
