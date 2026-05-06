import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerDashboardHomeEmptyStateView } from "../tracker-dashboard-home-emptyState.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerDashboardHomeEmptyStateView> = {
  title: "tracker/dashboard/home/emptyState.view",
  component: TrackerDashboardHomeEmptyStateView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=240-5",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerDashboardHomeEmptyStateView>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-dashboard-home-emptyState.view"
      variants={[
        {
          name: "default",
          render: () => <TrackerDashboardHomeEmptyStateView />,
        },
      ]}
    />
  ),
};
