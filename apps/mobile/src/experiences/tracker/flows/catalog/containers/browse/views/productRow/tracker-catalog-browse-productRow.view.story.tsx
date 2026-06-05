import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerCatalogBrowseProductRowView } from "./tracker-catalog-browse-productRow.view";

const UNIT = {
  id: "u1",
  brand: "Hermès",
  productLine: "Bolide",
  modelName: "Bolide 27",
};

const meta: Meta<typeof TrackerCatalogBrowseProductRowView> = {
  title: "tracker/catalog/browse/views/productRow",
  component: TrackerCatalogBrowseProductRowView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=868-29",
    },
  },
  args: { unit: UNIT, checked: false },
};

export default meta;
type Story = StoryObj<typeof TrackerCatalogBrowseProductRowView>;

export const Unchecked: Story = { args: { unit: UNIT, checked: false } };
export const Checked: Story = { args: { unit: UNIT, checked: true } };
