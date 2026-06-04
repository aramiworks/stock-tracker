import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerCatalogBrowseSkeletonCardView } from "./skeletonCard";

const meta: Meta<typeof TrackerCatalogBrowseSkeletonCardView> = {
  title: "tracker/catalog/browse/skeletonCard",
  component: TrackerCatalogBrowseSkeletonCardView,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof TrackerCatalogBrowseSkeletonCardView>;

export const Default: Story = {};
