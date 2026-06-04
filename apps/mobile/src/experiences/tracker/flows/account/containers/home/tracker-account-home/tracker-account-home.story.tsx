import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OverviewLayout } from "@aramiworks/ui";
import { TrackerAccountHomeViews } from "../views/tracker-account-home.views";

const meta: Meta<typeof TrackerAccountHomeViews> = {
  title: "tracker/account/home",
  component: TrackerAccountHomeViews,
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=788-4",
    },
  },
  argTypes: {
    screenState: {
      control: { type: "select" },
      options: ["default", "loading", "error"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerAccountHomeViews>;

export const Default: Story = {
  args: {
    screenState: "default",
    email: "user@example.com",
    createdAt: "2024-01-15T00:00:00Z",
  },
};
export const Loading: Story = { args: { screenState: "loading" } };
export const Error: Story = { args: { screenState: "error" } };

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-account-home"
      variants={[
        {
          name: "default",
          render: () => (
            <TrackerAccountHomeViews
              screenState="default"
              email="user@example.com"
              createdAt="2024-01-15T00:00:00Z"
            />
          ),
        },
        {
          name: "loading",
          render: () => <TrackerAccountHomeViews screenState="loading" />,
        },
        {
          name: "error",
          render: () => <TrackerAccountHomeViews screenState="error" />,
        },
      ]}
    />
  ),
};
