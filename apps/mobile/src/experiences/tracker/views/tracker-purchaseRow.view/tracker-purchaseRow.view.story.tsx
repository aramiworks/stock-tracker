import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerPurchaseRowView } from "../tracker-purchaseRow.view";

const meta: Meta<typeof TrackerPurchaseRowView> = {
  title: "tracker/views/purchaseRow",
  component: TrackerPurchaseRowView,
  parameters: { layout: "centered" },
  argTypes: {
    type: { control: { type: "select" }, options: ["regular", "tank"] },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerPurchaseRowView>;

export const Regular: Story = {
  args: {
    type: "regular",
    productName: "트리니티 링",
    date: "2024.03.15",
    amount: 3200000,
  },
};

export const Tank: Story = {
  args: {
    type: "tank",
    productName: "트리니티 링",
    date: "2024.03.15",
    amount: 3200000,
  },
};
