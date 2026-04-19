import { memo } from "react";
import { XStack, YStack, Skeleton, Spacer } from "@aramiworks/ui";

type TrackerSkeletonCardViewProps = {
  width?: number;
  height?: number;
  testID?: string;
};

export const TrackerSkeletonCardView = memo(
  ({ width = 310, height = 100, testID }: TrackerSkeletonCardViewProps) => {
    return (
      <XStack
        width={width}
        height={height}
        backgroundColor="#FAFAFA"
        borderRadius={14}
        overflow="hidden"
        alignItems="center"
        paddingHorizontal={14}
        testID={testID}
      >
        <Skeleton width={44} height={44} borderRadius={22} />
        <Spacer direction="horizontal" size={12} />
        <YStack flex={1}>
          <Skeleton width={100} height={12} />
          <Spacer direction="vertical" size={6} />
          <Skeleton width={80} height={10} />
          <Spacer direction="vertical" size={6} />
          <Skeleton width={120} height={10} />
        </YStack>
      </XStack>
    );
  },
);

TrackerSkeletonCardView.displayName = "TrackerSkeletonCardView";
