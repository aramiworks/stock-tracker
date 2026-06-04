import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerWatchlistListViews } from "./views";
import { WATCHLIST_LIST_MOCK_GROUPS } from "./models/tracker-watchlist-list.mock";

/**
 * Container-level Storybook entry for the watchlist list screen.
 *
 * Stamps the views composer directly with three full groups (Hermès / Bolide,
 * Hermès / Evelyne, Cartier / Tank Must) mirroring Figma frame 845-2 exactly.
 * All three watchable states are represented:
 *   - in_stock     (Bolide 27, Tank Must Small Leather)
 *   - out_of_stock (Bolide 31, Evelyne 29, Tank Must Large Steel)
 *   - unknown      (Evelyne 16)
 *
 * Figma frames:
 *   - Default: https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=845-2
 *   - Empty:   https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=845-69
 *   - Loading: https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=845-86
 */

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

export const Default: Story = {
  args: { screenState: "default", groups: WATCHLIST_LIST_MOCK_GROUPS },
};

export const Empty: Story = {
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=845-69",
    },
  },
  args: { screenState: "empty", onAddProductsPress: () => {} },
};

export const Loading: Story = {
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=845-86",
    },
  },
  args: { screenState: "loading" },
};

export const Error: Story = {
  args: { screenState: "error", onAddProductsPress: () => {} },
};
