import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerEligibilityBadgeView } from "../tracker-eligibilityBadge.view";

const meta: Meta<typeof TrackerEligibilityBadgeView> = {
  title: "tracker/views/eligibilityBadge",
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

export const Eligible: Story = { args: { status: "eligible" } };
export const NotEligible: Story = { args: { status: "notEligible" } };
