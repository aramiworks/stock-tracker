import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerDashboardHomeErrorStateView } from "../tracker-dashboard-home-errorState.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerDashboardHomeErrorStateView> = {
  title: "tracker/dashboard/home/errorState.view",
  component: TrackerDashboardHomeErrorStateView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=240-6",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerDashboardHomeErrorStateView>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-dashboard-home-errorState.view"
      variants={[
        {
          name: "default",
          render: () => <TrackerDashboardHomeErrorStateView />,
        },
      ]}
    />
  ),
};
