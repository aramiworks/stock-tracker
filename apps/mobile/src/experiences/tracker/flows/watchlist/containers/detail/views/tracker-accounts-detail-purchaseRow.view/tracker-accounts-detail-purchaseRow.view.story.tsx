import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerAccountsDetailPurchaseRowView } from "../tracker-accounts-detail-purchaseRow.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerAccountsDetailPurchaseRowView> = {
  title: "tracker/accounts/detail/purchaseRow.view",
  component: TrackerAccountsDetailPurchaseRowView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=241-8",
    },
  },
  argTypes: {
    type: { control: { type: "select" }, options: ["regular", "tank"] },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerAccountsDetailPurchaseRowView>;

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

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-accounts-detail-purchaseRow.view"
      variants={[
        {
          name: "regular",
          render: () => (
            <TrackerAccountsDetailPurchaseRowView
              type="regular"
              productName="트리니티 링"
              date="2024.03.15"
              amount={3200000}
            />
          ),
        },
        {
          name: "tank",
          render: () => (
            <TrackerAccountsDetailPurchaseRowView
              type="tank"
              productName="트리니티 링"
              date="2024.03.15"
              amount={3200000}
            />
          ),
        },
      ]}
    />
  ),
};
