import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OverviewLayout } from "@aramiworks/ui";
import { TrackerWatchlistListViews } from "./views";
import { WATCHLIST_LIST_MOCK_GROUPS } from "./models/tracker-watchlist-list.mock";

/**
 * Container-level Storybook entry for the watchlist list screen.
 *
 * Stamps the views composer directly with two fixed groups (Hermès / Bolide
 * + Hermès / Constance) covering all three watchable states:
 *   - in_stock  (Bolide 27)
 *   - out_of_stock (Bolide 31)
 *   - unknown   (Constance 18)
 *
 * Figma: https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=845-2
 */
const GROUPS = WATCHLIST_LIST_MOCK_GROUPS.slice(0, 2);

const meta: Meta<typeof TrackerWatchlistListViews> = {
  title: "tracker/watchlist/list",
  component: TrackerWatchlistListViews,
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=845-2",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerWatchlistListViews>;

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker/watchlist/list"
      variants={[
        {
          name: "default",
          render: () => (
            <TrackerWatchlistListViews screenState="default" groups={GROUPS} />
          ),
        },
        {
          name: "empty",
          render: () => (
            <TrackerWatchlistListViews screenState="empty" groups={[]} />
          ),
        },
        {
          name: "loading",
          render: () => <TrackerWatchlistListViews screenState="loading" />,
        },
        {
          name: "error",
          render: () => <TrackerWatchlistListViews screenState="error" />,
        },
      ]}
    />
  ),
};

export const Default: Story = {
  args: { screenState: "default", groups: GROUPS },
};

export const Empty: Story = {
  args: { screenState: "empty", groups: [] },
};

export const Loading: Story = {
  args: { screenState: "loading" },
};

export const Error: Story = {
  args: { screenState: "error" },
};
