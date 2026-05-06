import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerDashboardHomeSpendSummaryCardView } from "../tracker-dashboard-home-spendSummaryCard.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerDashboardHomeSpendSummaryCardView> = {
  title: "tracker/dashboard/home/spendSummaryCard.view",
  component: TrackerDashboardHomeSpendSummaryCardView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=240-3",
    },
  },
  argTypes: {
    state: {
      control: { type: "select" },
      options: ["populated", "zero", "loading"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof TrackerDashboardHomeSpendSummaryCardView>;

export const Populated: Story = {
  args: { state: "populated", totalSpend: 12450000, goalAmount: 30000000 },
};

export const Zero: Story = {
  args: { state: "zero", totalSpend: 0, goalAmount: 30000000 },
};

export const Loading: Story = {
  args: { state: "loading" },
};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-dashboard-home-spendSummaryCard.view"
      variants={[
        {
          name: "populated",
          render: () => (
            <TrackerDashboardHomeSpendSummaryCardView
              state="populated"
              totalSpend={12450000}
              goalAmount={30000000}
            />
          ),
        },
        {
          name: "zero",
          render: () => (
            <TrackerDashboardHomeSpendSummaryCardView
              state="zero"
              totalSpend={0}
              goalAmount={30000000}
            />
          ),
        },
        {
          name: "loading",
          render: () => (
            <TrackerDashboardHomeSpendSummaryCardView state="loading" />
          ),
        },
      ]}
    />
  ),
};

export const PixelMatch: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div
      style={{
        width: 786,
        height: 148,
        position: "relative",
        background: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: 24, top: 24 }}>
        <TrackerDashboardHomeSpendSummaryCardView
          state="populated"
          totalSpend={12450000}
          goalAmount={30000000}
        />
      </div>
      <div style={{ position: "absolute", left: 278, top: 24 }}>
        <TrackerDashboardHomeSpendSummaryCardView
          state="zero"
          totalSpend={0}
          goalAmount={30000000}
        />
      </div>
      <div style={{ position: "absolute", left: 532, top: 24 }}>
        <TrackerDashboardHomeSpendSummaryCardView state="loading" />
      </div>
    </div>
  ),
};
