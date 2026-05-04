import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerSkeletonCardView } from "../tracker-skeletonCard.view";
import { OverviewLayout, XStack, YStack, Skeleton } from "@aramiworks/ui";

const meta: Meta<typeof TrackerSkeletonCardView> = {
  title: "tracker/shared/skeletonCard.view",
  component: TrackerSkeletonCardView,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof TrackerSkeletonCardView>;

const AvatarLineSkeleton = () => (
  <XStack gap={12} alignItems="center">
    <Skeleton width={44} height={44} borderRadius={22} />
    <YStack flex={1} gap={6}>
      <Skeleton width={100} height={12} />
      <Skeleton width={80} height={10} />
      <Skeleton width={120} height={10} />
    </YStack>
  </XStack>
);

export const Default: Story = {
  render: () => (
    <TrackerSkeletonCardView>
      <AvatarLineSkeleton />
    </TrackerSkeletonCardView>
  ),
};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-skeletonCard.view"
      variants={[
        {
          name: "default",
          render: () => (
            <TrackerSkeletonCardView>
              <AvatarLineSkeleton />
            </TrackerSkeletonCardView>
          ),
        },
      ]}
    />
  ),
};
