import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerCatalogBrowseViews } from "./views";
import { CATALOG_MOCK_GROUPS } from "./models/tracker-catalog-browse.mock";

/**
 * Container-level Storybook entry for the catalog browse screen.
 *
 * Stamps the views composer directly with two fixed groups of three rows each
 * (Bolide + Picotin) and a mixed checked/unchecked selection, exercising both
 * group-state branches ("some" + "none") and the default group-state resolver.
 *
 * Figma: https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=842-2
 */
const BOLIDE = CATALOG_MOCK_GROUPS[0]; // 3 units
const PICOTIN = CATALOG_MOCK_GROUPS.find((g) => g.productLine === "Picotin")!;

const GROUPS = [BOLIDE, PICOTIN];

const SELECTED_UNIT_IDS = new Set<string>([
  // 1/3 checked in Bolide → group state "some"
  BOLIDE.units[0].id,
  // 0/3 checked in Picotin → group state "none"
]);

const meta: Meta<typeof TrackerCatalogBrowseViews> = {
  title: "tracker/catalog/browse",
  component: TrackerCatalogBrowseViews,
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=842-2",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerCatalogBrowseViews>;

export const Default: Story = {
  args: {
    screenState: "default",
    groups: GROUPS,
    selectedUnitIds: SELECTED_UNIT_IDS,
  },
};
