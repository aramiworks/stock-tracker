import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerAccountsDetailTankStatusView } from "../tracker-accounts-detail-tankStatus.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerAccountsDetailTankStatusView> = {
  title: "tracker/accounts/detail/tankStatus.view",
  component: TrackerAccountsDetailTankStatusView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=241-7",
    },
  },
  argTypes: {
    state: {
      control: { type: "select" },
      options: ["eligible", "notEligible"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerAccountsDetailTankStatusView>;

export const Eligible: Story = { args: { state: "eligible" } };
export const NotEligible: Story = { args: { state: "notEligible" } };

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-accounts-detail-tankStatus.view"
      variants={[
        {
          name: "eligible",
          render: () => (
            <TrackerAccountsDetailTankStatusView state="eligible" />
          ),
        },
        {
          name: "notEligible",
          render: () => (
            <TrackerAccountsDetailTankStatusView state="notEligible" />
          ),
        },
      ]}
    />
  ),
};
