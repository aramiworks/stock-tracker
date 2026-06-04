import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerWatchlistListStatePillView } from "./tracker-watchlist-list-statePill.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerWatchlistListStatePillView> = {
  title: "tracker/watchlist/list/statePill",
  component: TrackerWatchlistListStatePillView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=845-2",
    },
  },
  argTypes: {
    state: {
      control: { type: "select" },
      options: ["in_stock", "out_of_stock", "unknown"],
    },
  },
  args: { state: "in_stock" },
};

export default meta;
type Story = StoryObj<typeof TrackerWatchlistListStatePillView>;

export const InStock: Story = { args: { state: "in_stock" } };
export const OutOfStock: Story = { args: { state: "out_of_stock" } };
export const Unknown: Story = { args: { state: "unknown" } };

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker/watchlist/list/statePill"
      variants={[
        {
          name: "in_stock",
          render: () => <TrackerWatchlistListStatePillView state="in_stock" />,
        },
        {
          name: "out_of_stock",
          render: () => (
            <TrackerWatchlistListStatePillView state="out_of_stock" />
          ),
        },
        {
          name: "unknown",
          render: () => <TrackerWatchlistListStatePillView state="unknown" />,
        },
      ]}
    />
  ),
};
