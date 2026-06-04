import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerEligibilityBadgeView } from "../tracker-eligibilityBadge.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerEligibilityBadgeView> = {
  title: "tracker/shared/views/eligibilityBadge",
  component: TrackerEligibilityBadgeView,
  parameters: { layout: "centered" },
  argTypes: {
    status: {
      control: { type: "select" },
      options: ["eligible", "notEligible"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerEligibilityBadgeView>;

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-eligibilityBadge.view"
      variants={[
        {
          name: "eligible",
          render: () => <TrackerEligibilityBadgeView status="eligible" />,
        },
        {
          name: "notEligible",
          render: () => <TrackerEligibilityBadgeView status="notEligible" />,
        },
      ]}
    />
  ),
};

export const Eligible: Story = { args: { status: "eligible" } };
export const NotEligible: Story = { args: { status: "notEligible" } };
