import { memo } from "react";
import { TrackerErrorStateView } from "@/experiences/tracker/views/tracker-errorState.view";

type Props = {
  onRetry?: () => void;
};

export const TrackerAccountHomeErrorStateView = memo<Props>(({ onRetry }) => (
  <TrackerErrorStateView onRetry={onRetry} testID="account-home-error-state" />
));

TrackerAccountHomeErrorStateView.displayName =
  "TrackerAccountHomeErrorStateView";
