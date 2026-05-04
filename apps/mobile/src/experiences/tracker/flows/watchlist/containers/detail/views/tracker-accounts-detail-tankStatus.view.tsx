import { memo } from "react";
import { TrackerEligibilityBadgeView } from "@/experiences/tracker/views";

type TrackerAccountsDetailTankStatusViewProps = {
  state?: "eligible" | "notEligible";
  testID?: string;
};

export const TrackerAccountsDetailTankStatusView = memo(
  ({
    state = "eligible",
    testID,
  }: TrackerAccountsDetailTankStatusViewProps) => {
    return <TrackerEligibilityBadgeView status={state} testID={testID} />;
  },
);

TrackerAccountsDetailTankStatusView.displayName =
  "TrackerAccountsDetailTankStatusView";
