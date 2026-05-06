import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerDashboardHomeSaCardView } from "../tracker-dashboard-home-saCard.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerDashboardHomeSaCardView> = {
  title: "tracker/dashboard/home/saCard.view",
  component: TrackerDashboardHomeSaCardView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=240-4",
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
type Story = StoryObj<typeof TrackerDashboardHomeSaCardView>;

export const Eligible: Story = { args: { state: "eligible" } };

export const NotEligible: Story = {
  args: {
    state: "notEligible",
    name: "김서연 SA",
    boutique: "청담 부티크",
    totalSpend: 8200000,
  },
};

export const NoPurchases: Story = {
  args: { state: "noPurchases", name: "김서연 SA", boutique: "청담 부티크" },
};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-dashboard-home-saCard.view"
      variants={[
        {
          name: "eligible",
          render: () => <TrackerDashboardHomeSaCardView state="eligible" />,
        },
        {
          name: "notEligible",
          render: () => <TrackerDashboardHomeSaCardView state="notEligible" />,
        },
        {
          name: "noPurchases",
          render: () => <TrackerDashboardHomeSaCardView state="noPurchases" />,
        },
      ]}
    />
  ),
};
