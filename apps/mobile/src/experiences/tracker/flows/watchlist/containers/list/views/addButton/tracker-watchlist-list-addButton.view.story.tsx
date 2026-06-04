import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerWatchlistListAddButtonView } from "./tracker-watchlist-list-addButton.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerWatchlistListAddButtonView> = {
  title: "tracker/watchlist/list/addButton",
  component: TrackerWatchlistListAddButtonView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=845-5",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerWatchlistListAddButtonView>;

// Default matches Figma node 845-5 (add action inside frame 845-2):
// the "+ 추가" pill rendered in the top-app-bar trailing slot.
export const Default: Story = { args: { onPress: () => {} } };

// NoOp shows the null-render branch — component returns null when onPress
// is omitted (e.g. when the catalog destination is unreachable).
export const NoOp: Story = { args: {} };

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker/watchlist/list/addButton"
      variants={[
        {
          name: "default (with-press)",
          render: () => (
            <TrackerWatchlistListAddButtonView onPress={() => {}} />
          ),
        },
        {
          name: "no-op (null render)",
          render: () => <TrackerWatchlistListAddButtonView />,
        },
      ]}
    />
  ),
};
