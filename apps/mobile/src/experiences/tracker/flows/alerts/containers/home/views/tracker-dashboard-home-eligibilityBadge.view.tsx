import { memo } from "react";
import { TrackerEligibilityBadgeView } from "@/experiences/tracker/views";

type TrackerDashboardHomeEligibilityBadgeViewProps = {
  state?: "eligible" | "notEligible";
};

export const TrackerDashboardHomeEligibilityBadgeView = memo(
  ({ state = "eligible" }: TrackerDashboardHomeEligibilityBadgeViewProps) => {
    return <TrackerEligibilityBadgeView status={state} />;
  },
);

TrackerDashboardHomeEligibilityBadgeView.displayName =
  "TrackerDashboardHomeEligibilityBadgeView";
