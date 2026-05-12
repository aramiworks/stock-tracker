import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerAccountsListEmptyStateView } from "../tracker-accounts-list-emptyState.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerAccountsListEmptyStateView> = {
  title: "tracker/accounts/list/emptyState.view",
  component: TrackerAccountsListEmptyStateView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=241-3",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerAccountsListEmptyStateView>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-accounts-list-emptyState.view"
      variants={[
        {
          name: "default",
          render: () => <TrackerAccountsListEmptyStateView />,
        },
      ]}
    />
  ),
};
