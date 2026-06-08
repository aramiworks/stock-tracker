import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerCatalogBrowseBrandFilterView } from "./tracker-catalog-browse-brandFilter.view";
import { OverviewLayout } from "@aramiworks/ui";

const BRANDS = ["Hermès", "Cartier"];

const meta: Meta<typeof TrackerCatalogBrowseBrandFilterView> = {
  title: "tracker/catalog/browse/brandFilter",
  component: TrackerCatalogBrowseBrandFilterView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=986-2",
    },
  },
  args: { brands: BRANDS, selectedBrand: "Hermès" },
};

export default meta;
type Story = StoryObj<typeof TrackerCatalogBrowseBrandFilterView>;

export const Hermes: Story = {
  args: { brands: BRANDS, selectedBrand: "Hermès" },
};
export const Cartier: Story = {
  args: { brands: BRANDS, selectedBrand: "Cartier" },
};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker/catalog/browse/brandFilter"
      variants={[
        {
          name: "hermès",
          render: () => (
            <TrackerCatalogBrowseBrandFilterView
              brands={BRANDS}
              selectedBrand="Hermès"
            />
          ),
        },
        {
          name: "cartier",
          render: () => (
            <TrackerCatalogBrowseBrandFilterView
              brands={BRANDS}
              selectedBrand="Cartier"
            />
          ),
        },
      ]}
    />
  ),
};
