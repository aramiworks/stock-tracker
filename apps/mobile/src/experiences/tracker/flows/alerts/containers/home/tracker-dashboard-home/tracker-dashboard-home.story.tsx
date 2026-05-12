import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OverviewLayout } from "@aramiworks/ui";
import { TrackerDashboardHomeViews } from "../views/tracker-dashboard-home.views";

const meta: Meta<typeof TrackerDashboardHomeViews> = {
  title: "tracker/dashboard/home",
  component: TrackerDashboardHomeViews,
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=269-2",
    },
  },
  argTypes: {
    screenState: {
      control: { type: "select" },
      options: ["default", "empty", "loading", "error"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerDashboardHomeViews>;

export const Default: Story = { args: { screenState: "default" } };
export const Empty: Story = { args: { screenState: "empty" } };
export const Loading: Story = { args: { screenState: "loading" } };
export const Error: Story = { args: { screenState: "error" } };

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-dashboard-home"
      variants={[
        {
          name: "default",
          render: () => <TrackerDashboardHomeViews screenState="default" />,
        },
        {
          name: "empty",
          render: () => <TrackerDashboardHomeViews screenState="empty" />,
        },
        {
          name: "loading",
          render: () => <TrackerDashboardHomeViews screenState="loading" />,
        },
        {
          name: "error",
          render: () => <TrackerDashboardHomeViews screenState="error" />,
        },
      ]}
    />
  ),
};
