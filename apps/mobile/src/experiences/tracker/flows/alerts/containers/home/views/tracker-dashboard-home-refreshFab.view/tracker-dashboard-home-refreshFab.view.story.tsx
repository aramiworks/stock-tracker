import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerDashboardHomeRefreshFabView } from "../tracker-dashboard-home-refreshFab.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerDashboardHomeRefreshFabView> = {
  title: "tracker/dashboard/home/refreshFab.view",
  component: TrackerDashboardHomeRefreshFabView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=240-7",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerDashboardHomeRefreshFabView>;

export const Default: Story = { args: {} };

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-dashboard-home-refreshFab.view"
      variants={[
        {
          name: "default",
          render: () => <TrackerDashboardHomeRefreshFabView />,
        },
      ]}
    />
  ),
};
