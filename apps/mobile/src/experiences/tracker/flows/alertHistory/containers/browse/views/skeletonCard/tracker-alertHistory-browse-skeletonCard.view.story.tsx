import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerAlertHistoryBrowseSkeletonCardView } from "./tracker-alertHistory-browse-skeletonCard.view";

const meta: Meta<typeof TrackerAlertHistoryBrowseSkeletonCardView> = {
  title: "tracker/alertHistory/browse/views/skeletonCard",
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
