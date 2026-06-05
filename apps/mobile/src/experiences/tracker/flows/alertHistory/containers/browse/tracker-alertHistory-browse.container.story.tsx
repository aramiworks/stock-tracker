import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OverviewLayout } from "@aramiworks/ui";
import { TrackerAlertHistoryBrowseViews } from "./views";
import type { AlertHistoryEvent } from "./models/tracker-alertHistory-browse.type";

const EVENTS: AlertHistoryEvent[] = [
  {
    id: "ah-bolide-27-restock-1",
    brand: "Hermès",
    productLine: "Bolide",
    modelName: "Bolide 27",
    skuDescriptor: "Noir · Togo · Gold",
    kind: "restocked",
    detectedAt: "2026-05-19T09:14:00.000Z",
  },
  {
    id: "ah-bolide-31-soldout-1",
    brand: "Hermès",
    productLine: "Bolide",
    modelName: "Bolide 31",
    skuDescriptor: "Étoupe · Clemence · Palladium",
    kind: "soldOut",
    detectedAt: "2026-05-18T22:03:00.000Z",
  },
  {
    id: "ah-birkin-25-restock-1",
    brand: "Hermès",
    productLine: "Birkin",
    modelName: "Birkin 25",
    skuDescriptor: "Gold · Togo · Gold",
    kind: "restocked",
    detectedAt: "2026-05-17T14:42:00.000Z",
  },
  {
    id: "ah-kelly-28-soldout-1",
    brand: "Hermès",
    productLine: "Kelly",
    modelName: "Kelly 28",
    skuDescriptor: "Noir · Epsom · Palladium",
    kind: "soldOut",
    detectedAt: "2026-05-16T08:11:00.000Z",
  },
  {
    id: "ah-constance-18-restock-1",
    brand: "Hermès",
    productLine: "Constance",
    modelName: "Constance 18",
    skuDescriptor: "Rouge H · Box · Gold",
    kind: "restocked",
    detectedAt: "2026-05-15T19:27:00.000Z",
  },
  {
    id: "ah-picotin-22-soldout-1",
    brand: "Hermès",
    productLine: "Picotin",
    modelName: "Picotin Lock 22",
    skuDescriptor: "Vert Criquet · Clemence · Palladium",
    kind: "soldOut",
    detectedAt: "2026-05-14T11:03:00.000Z",
  },
];

/**
 * Container-level Storybook entry for the alert-history browse screen.
 *
 * Stamps the views composer directly with a fixed `events` array — bypasses the
 * live Apollo client so the story remains stable in Chromatic. Mirrors the
 * default route at `/(app)/(tabs)/alerts`.
 *
 * Figma: https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=623-1129
 */
const meta: Meta<typeof TrackerAlertHistoryBrowseViews> = {
  title: "tracker/alertHistory/browse",
  component: TrackerAlertHistoryBrowseViews,
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=623-1129",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerAlertHistoryBrowseViews>;

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker/alertHistory/browse"
      variants={[
        {
          name: "default",
          render: () => (
            <TrackerAlertHistoryBrowseViews
              screenState="default"
              events={EVENTS}
            />
          ),
        },
        {
          name: "empty",
          render: () => (
            <TrackerAlertHistoryBrowseViews screenState="empty" events={[]} />
          ),
        },
        {
          name: "loading",
          render: () => (
            <TrackerAlertHistoryBrowseViews screenState="loading" />
          ),
        },
        {
          name: "error",
          render: () => (
            <TrackerAlertHistoryBrowseViews
              screenState="error"
              onRetry={() => undefined}
            />
          ),
        },
      ]}
    />
  ),
};

export const Default: Story = {
  args: { screenState: "default", events: EVENTS },
};

export const Empty: Story = {
  args: { screenState: "empty", events: [] },
};

export const Loading: Story = {
  args: { screenState: "loading" },
};

export const Error: Story = {
  args: { screenState: "error", onRetry: () => undefined },
};
