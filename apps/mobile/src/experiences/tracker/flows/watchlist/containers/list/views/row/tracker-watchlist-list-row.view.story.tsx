import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerWatchlistListRowView } from "./tracker-watchlist-list-row.view";
import type { WatchlistEntry } from "../../models/tracker-watchlist-list.type";
import { OverviewLayout } from "@aramiworks/ui";

const IN_STOCK: WatchlistEntry = {
  id: "wl-bolide-27",
  watchableUnitId: "11111111-1111-1111-1111-000000000001",
  brand: "Hermès",
  productLine: "Bolide",
  modelName: "Bolide 27",
  state: "in_stock",
  lastRestockedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
};

const OUT_OF_STOCK: WatchlistEntry = {
  ...IN_STOCK,
  id: "wl-bolide-31",
  watchableUnitId: "11111111-1111-1111-1111-000000000002",
  modelName: "Bolide 31",
  state: "out_of_stock",
  lastRestockedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
};

const UNKNOWN: WatchlistEntry = {
  ...IN_STOCK,
  id: "wl-constance-18",
  watchableUnitId: "11111111-1111-1111-1111-000000000010",
  productLine: "Constance",
  modelName: "Constance 18",
  state: "unknown",
  lastRestockedAt: null,
};

const meta: Meta<typeof TrackerWatchlistListRowView> = {
  title: "tracker/watchlist/list/views/row",
  component: TrackerWatchlistListRowView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=845-10",
    },
  },
  args: { entry: IN_STOCK },
};

export default meta;
type Story = StoryObj<typeof TrackerWatchlistListRowView>;

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker/watchlist/list/row"
      variants={[
        {
          name: "in_stock",
          render: () => <TrackerWatchlistListRowView entry={IN_STOCK} />,
        },
        {
          name: "out_of_stock",
          render: () => <TrackerWatchlistListRowView entry={OUT_OF_STOCK} />,
        },
        {
          name: "unknown",
          render: () => <TrackerWatchlistListRowView entry={UNKNOWN} />,
        },
      ]}
    />
  ),
};

export const InStock: Story = { args: { entry: IN_STOCK } };
export const OutOfStock: Story = { args: { entry: OUT_OF_STOCK } };
export const Unknown: Story = { args: { entry: UNKNOWN } };
