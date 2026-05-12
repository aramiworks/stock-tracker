import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerAccountsListErrorStateView } from "../tracker-accounts-list-errorState.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerAccountsListErrorStateView> = {
  title: "tracker/accounts/list/errorState.view",
  component: TrackerAccountsListErrorStateView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=241-4",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerAccountsListErrorStateView>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-accounts-list-errorState.view"
      variants={[
        {
          name: "default",
          render: () => <TrackerAccountsListErrorStateView />,
        },
      ]}
    />
  ),
};
