import { memo } from "react";
import { FAB } from "@aramiworks/ui";

type TrackerDashboardHomeRefreshFabViewProps = {
  onPress?: () => void;
};

export const TrackerDashboardHomeRefreshFabView = memo(
  ({ onPress }: TrackerDashboardHomeRefreshFabViewProps) => {
    return (
      <FAB
        icon="refresh"
        color="primary"
        onPress={onPress}
        accessibilityLabel="새로고침"
        testID="refresh-fab"
      />
    );
  },
);

TrackerDashboardHomeRefreshFabView.displayName =
  "TrackerDashboardHomeRefreshFabView";
