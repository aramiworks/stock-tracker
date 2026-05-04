import { memo, type ReactNode } from "react";
import { Card } from "@aramiworks/ui";

type TrackerSkeletonCardViewProps = {
  children?: ReactNode;
  testID?: string;
};

export const TrackerSkeletonCardView = memo(
  ({ children, testID }: TrackerSkeletonCardViewProps) => (
    <Card variant="filled" testID={testID}>
      {children}
    </Card>
  ),
);

TrackerSkeletonCardView.displayName = "TrackerSkeletonCardView";
