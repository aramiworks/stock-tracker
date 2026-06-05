import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerWatchlistListGroupHeaderView } from "./tracker-watchlist-list-groupHeader.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerWatchlistListGroupHeaderView> = {
  title: "tracker/watchlist/list/groupHeader",
  component: TrackerWatchlistListGroupHeaderView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=845-2",
    },
  },
  args: { brand: "Hermès", productLine: "Bolide" },
};

export default meta;
type Story = StoryObj<typeof TrackerWatchlistListGroupHeaderView>;

export const Hermes: Story = {
  args: { brand: "Hermès", productLine: "Bolide" },
};

export const Cartier: Story = {
  args: { brand: "Cartier", productLine: "Tank Must" },
};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker/watchlist/list/groupHeader"
      variants={[
        {
          name: "hermès / bolide",
          render: () => (
            <TrackerWatchlistListGroupHeaderView
              brand="Hermès"
              productLine="Bolide"
            />
          ),
        },
        {
          name: "hermès / evelyne",
          render: () => (
            <TrackerWatchlistListGroupHeaderView
              brand="Hermès"
              productLine="Evelyne"
            />
          ),
        },
        {
          name: "cartier / tank must",
          render: () => (
            <TrackerWatchlistListGroupHeaderView
              brand="Cartier"
              productLine="Tank Must"
            />
          ),
        },
      ]}
    />
  ),
};
