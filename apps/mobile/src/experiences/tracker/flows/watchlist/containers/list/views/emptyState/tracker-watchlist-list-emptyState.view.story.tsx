import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerWatchlistListEmptyStateView } from "./tracker-watchlist-list-emptyState.view";

const meta: Meta<typeof TrackerWatchlistListEmptyStateView> = {
  title: "tracker/watchlist/list/views/emptyState",
  component: TrackerWatchlistListEmptyStateView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=845-69",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerWatchlistListEmptyStateView>;

// Default matches the Figma 845-69 layout: icon + title + body + pill CTA.
// The no-CTA variant only renders when the container omits onAddPress
// (e.g. when the catalog destination is unreachable).
export const Default: Story = { args: { onAddPress: () => {} } };
export const NoCta: Story = { args: {} };
