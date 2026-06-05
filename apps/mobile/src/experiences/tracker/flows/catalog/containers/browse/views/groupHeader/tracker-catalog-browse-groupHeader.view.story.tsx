import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerCatalogBrowseGroupHeaderView } from "./tracker-catalog-browse-groupHeader.view";

const BOLIDE_GROUP = {
  brand: "Hermès",
  productLine: "Bolide",
  units: [
    {
      id: "u1",
      brand: "Hermès",
      productLine: "Bolide",
      modelName: "Bolide 27",
    },
    {
      id: "u2",
      brand: "Hermès",
      productLine: "Bolide",
      modelName: "Bolide 31",
    },
    {
      id: "u3",
      brand: "Hermès",
      productLine: "Bolide",
      modelName: "Bolide 35",
    },
  ],
};

const meta: Meta<typeof TrackerCatalogBrowseGroupHeaderView> = {
  title: "tracker/catalog/browse/views/groupHeader",
  component: TrackerCatalogBrowseGroupHeaderView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=868-47",
    },
  },
  argTypes: {
    state: {
      control: { type: "select" },
      options: ["all", "some", "none"],
    },
  },
  args: { group: BOLIDE_GROUP, state: "none" },
};

export default meta;
type Story = StoryObj<typeof TrackerCatalogBrowseGroupHeaderView>;

export const None: Story = { args: { group: BOLIDE_GROUP, state: "none" } };
export const Some: Story = { args: { group: BOLIDE_GROUP, state: "some" } };
export const All: Story = { args: { group: BOLIDE_GROUP, state: "all" } };
