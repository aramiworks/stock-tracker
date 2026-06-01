import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerAlertHistoryBrowseEmptyStateView } from "./emptyState";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerAlertHistoryBrowseEmptyStateView> = {
  title: "tracker/alertHistory/browse/emptyState",
  component: TrackerAlertHistoryBrowseEmptyStateView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=623-1150",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerAlertHistoryBrowseEmptyStateView>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker/alertHistory/browse/emptyState"
      variants={[
        {
          name: "default (figma 623:1150)",
          render: () => <TrackerAlertHistoryBrowseEmptyStateView />,
        },
      ]}
    />
  ),
};
