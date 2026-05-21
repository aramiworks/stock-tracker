import { memo } from "react";
import { TrackerAlertHistoryModels } from "./models";
import { TrackerAlertHistoryControllers } from "./controllers";
import { TrackerAlertHistoryViews } from "./views";

/**
 * Flow-level scaffold for the alert-history experience. Mirrors `tracker-watchlist.flow.tsx`.
 *
 * The route (`app/(app)/tracker/history/browse/index.tsx`) currently mounts the
 * `TrackerAlertHistoryBrowseContainer` directly. This flow file exists so the
 * MCVL structure is uniform across flows and so future containers (e.g.
 * `alertHistory/detail`) can compose against the same flow-level providers.
 */
export const TrackerAlertHistoryFlow = memo(() => {
  return (
    <TrackerAlertHistoryModels>
      <TrackerAlertHistoryControllers>
        <TrackerAlertHistoryViews />
      </TrackerAlertHistoryControllers>
    </TrackerAlertHistoryModels>
  );
});

TrackerAlertHistoryFlow.displayName = "TrackerAlertHistoryFlow";
