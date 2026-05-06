import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerAccountsListSaListItemView } from "../tracker-accounts-list-saListItem.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerAccountsListSaListItemView> = {
  title: "tracker/accounts/list/saListItem.view",
  component: TrackerAccountsListSaListItemView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=241-2",
    },
  },
  argTypes: {
    state: {
      control: { type: "select" },
      options: ["eligible", "notEligible", "noPurchases"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerAccountsListSaListItemView>;

export const Eligible: Story = { args: { state: "eligible" } };
export const NotEligible: Story = { args: { state: "notEligible" } };
export const NoPurchases: Story = { args: { state: "noPurchases" } };

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-accounts-list-saListItem.view"
      variants={[
        {
          name: "eligible",
          render: () => <TrackerAccountsListSaListItemView state="eligible" />,
        },
        {
          name: "notEligible",
          render: () => (
            <TrackerAccountsListSaListItemView state="notEligible" />
          ),
        },
        {
          name: "noPurchases",
          render: () => (
            <TrackerAccountsListSaListItemView state="noPurchases" />
          ),
        },
      ]}
    />
  ),
};
