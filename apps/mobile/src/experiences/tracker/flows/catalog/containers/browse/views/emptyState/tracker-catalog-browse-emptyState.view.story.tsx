import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerCatalogBrowseEmptyStateView } from "./tracker-catalog-browse-emptyState.view";

const meta: Meta<typeof TrackerCatalogBrowseEmptyStateView> = {
  title: "tracker/catalog/browse/emptyState",
  component: TrackerCatalogBrowseEmptyStateView,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof TrackerCatalogBrowseEmptyStateView>;

export const Default: Story = {};
