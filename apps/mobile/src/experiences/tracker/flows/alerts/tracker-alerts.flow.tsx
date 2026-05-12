import { memo } from "react";
import { TrackerAlertsModels } from "./models";
import { TrackerAlertsControllers } from "./controllers";
import { TrackerAlertsViews } from "./views";

export const TrackerAlertsFlow = memo(() => {
  return (
    <TrackerAlertsModels>
      <TrackerAlertsControllers>
        <TrackerAlertsViews />
      </TrackerAlertsControllers>
    </TrackerAlertsModels>
  );
});

TrackerAlertsFlow.displayName = "TrackerAlertsFlow";
