import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerAccountsDetailSaHeaderView } from "../tracker-accounts-detail-saHeader.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerAccountsDetailSaHeaderView> = {
  title: "tracker/accounts/detail/saHeader.view",
  component: TrackerAccountsDetailSaHeaderView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=241-6",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerAccountsDetailSaHeaderView>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-accounts-detail-saHeader.view"
      variants={[
        {
          name: "default",
          render: () => <TrackerAccountsDetailSaHeaderView />,
        },
      ]}
    />
  ),
};
