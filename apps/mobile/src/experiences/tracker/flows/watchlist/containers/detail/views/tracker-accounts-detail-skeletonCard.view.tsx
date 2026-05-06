import { memo } from "react";
import { TrackerSkeletonCardView } from "@/experiences/tracker/views";
import { XStack, YStack, Skeleton } from "@aramiworks/ui";

export const TrackerAccountsDetailSkeletonCardView = memo(() => (
  <TrackerSkeletonCardView>
    <XStack gap={12} alignItems="center">
      <Skeleton width={44} height={44} borderRadius={22} />
      <YStack flex={1} gap={6}>
        <Skeleton width={100} height={12} />
        <Skeleton width={80} height={10} />
        <Skeleton width={120} height={10} />
      </YStack>
    </XStack>
  </TrackerSkeletonCardView>
));

TrackerAccountsDetailSkeletonCardView.displayName =
  "TrackerAccountsDetailSkeletonCardView";
