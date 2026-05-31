import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerAlertHistoryBrowseSkeletonCardView } from "./skeletonCard";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerAlertHistoryBrowseSkeletonCardView> = {
  title: "tracker/alertHistory/browse/skeletonCard",
  component: TrackerAlertHistoryBrowseSkeletonCardView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=623-1183",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerAlertHistoryBrowseSkeletonCardView>;

export const Default: Story = { args: { count: 1 } };
export const FiveRows: Story = { args: { count: 5 } };

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker/alertHistory/browse/skeletonCard"
      variants={[
        {
          name: "one row",
          render: () => <TrackerAlertHistoryBrowseSkeletonCardView count={1} />,
        },
        {
          name: "five rows (figma 623:1183)",
          render: () => <TrackerAlertHistoryBrowseSkeletonCardView count={5} />,
        },
      ]}
    />
  ),
};
