import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OverviewLayout } from "@aramiworks/ui";
import { TrackerAccountsDetailViews } from "../views/tracker-accounts-detail.views";

const meta: Meta<typeof TrackerAccountsDetailViews> = {
  title: "tracker/accounts/detail",
  component: TrackerAccountsDetailViews,
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=269-4",
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
type Story = StoryObj<typeof TrackerAccountsDetailViews>;

export const Default: Story = { args: { screenState: "default" } };
export const Loading: Story = { args: { screenState: "loading" } };
export const Error: Story = { args: { screenState: "error" } };

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-accounts-detail"
      variants={[
        {
          name: "default",
          render: () => <TrackerAccountsDetailViews screenState="default" />,
        },
        {
          name: "loading",
          render: () => <TrackerAccountsDetailViews screenState="loading" />,
        },
        {
          name: "error",
          render: () => <TrackerAccountsDetailViews screenState="error" />,
        },
      ]}
    />
  ),
};
