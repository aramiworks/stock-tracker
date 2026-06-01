import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerWatchlistDetailViews } from "./views";
import { WATCHLIST_DETAIL_MOCK } from "../models/tracker-watchlist-detail.mock";
import { OverviewLayout } from "@aramiworks/ui";

const BOLIDE_PAYLOAD =
  WATCHLIST_DETAIL_MOCK["11111111-1111-1111-1111-000000000001"];
const TANK_MUST_PAYLOAD =
  WATCHLIST_DETAIL_MOCK["22222222-2222-2222-2222-000000000001"];

const meta: Meta<typeof TrackerWatchlistDetailViews> = {
  title: "tracker/watchlist/detail.views",
  // Note: container-level Storybook entry lives at
  // ../tracker-watchlist-detail.container.story.tsx
  component: TrackerWatchlistDetailViews,
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=846-2",
    },
  },
  args: { screenState: "default", payload: BOLIDE_PAYLOAD },
};

export default meta;
type Story = StoryObj<typeof TrackerWatchlistDetailViews>;

export const HermesBolide: Story = {
  args: { screenState: "default", payload: BOLIDE_PAYLOAD },
};

export const CartierEmptyHistory: Story = {
  args: { screenState: "default", payload: TANK_MUST_PAYLOAD },
};

export const Loading: Story = { args: { screenState: "loading" } };
export const Error: Story = { args: { screenState: "error" } };

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker/watchlist/detail.views"
      variants={[
        {
          name: "default — full history (hermès bolide 27)",
          render: () => (
            <TrackerWatchlistDetailViews
              screenState="default"
              payload={BOLIDE_PAYLOAD}
            />
          ),
        },
        {
          name: "default — empty history (cartier tank must)",
          render: () => (
            <TrackerWatchlistDetailViews
              screenState="default"
              payload={TANK_MUST_PAYLOAD}
            />
          ),
        },
        {
          name: "loading",
          render: () => <TrackerWatchlistDetailViews screenState="loading" />,
        },
        {
          name: "error",
          render: () => <TrackerWatchlistDetailViews screenState="error" />,
        },
      ]}
    />
  ),
};
