import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerAlertHistoryBrowseRowView } from "../tracker-alertHistory-browse-row.view";
import type { AlertHistoryEvent } from "../../models/tracker-alertHistory-browse.type";
import { OverviewLayout } from "@aramiworks/ui";

const RESTOCKED: AlertHistoryEvent = {
  id: "ah-bolide-27-restock-1",
  brand: "Hermès",
  productLine: "Bolide",
  modelName: "Bolide 27",
  skuDescriptor: "Noir · Togo · Gold",
  kind: "restocked",
  detectedAt: "2026-05-19T09:14:00.000Z",
};

const SOLD_OUT: AlertHistoryEvent = {
  ...RESTOCKED,
  id: "ah-bolide-31-soldout-1",
  modelName: "Bolide 31",
  skuDescriptor: "Étoupe · Clemence · Palladium",
  kind: "soldOut",
  detectedAt: "2026-05-18T22:03:00.000Z",
};

const meta: Meta<typeof TrackerAlertHistoryBrowseRowView> = {
  title: "tracker/alertHistory/browse/row.view",
  component: TrackerAlertHistoryBrowseRowView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=623-1129",
    },
  },
  args: { event: RESTOCKED },
};

export default meta;
type Story = StoryObj<typeof TrackerAlertHistoryBrowseRowView>;

export const Restocked: Story = { args: { event: RESTOCKED } };
export const SoldOut: Story = { args: { event: SOLD_OUT } };

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-alertHistory-browse-row.view"
      variants={[
        {
          name: "restocked",
          render: () => <TrackerAlertHistoryBrowseRowView event={RESTOCKED} />,
        },
        {
          name: "soldOut",
          render: () => <TrackerAlertHistoryBrowseRowView event={SOLD_OUT} />,
        },
      ]}
    />
  ),
};
