import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerWatchlistListSkeletonCardView } from "../tracker-watchlist-list-skeletonCard.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerWatchlistListSkeletonCardView> = {
  title: "tracker/watchlist/list/skeletonCard.view",
  component: TrackerWatchlistListSkeletonCardView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=845-86",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerWatchlistListSkeletonCardView>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-watchlist-list-skeletonCard.view"
      variants={[
        {
          name: "default",
          render: () => <TrackerWatchlistListSkeletonCardView />,
        },
      ]}
    />
  ),
};
