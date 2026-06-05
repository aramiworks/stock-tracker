import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerWatchlistListStatePillView } from "./tracker-watchlist-list-statePill.view";

const meta: Meta<typeof TrackerWatchlistListStatePillView> = {
  title: "tracker/watchlist/list/views/statePill",
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
