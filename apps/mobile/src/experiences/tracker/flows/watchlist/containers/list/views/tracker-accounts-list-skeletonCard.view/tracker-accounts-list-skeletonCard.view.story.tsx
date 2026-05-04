import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerAccountsListSkeletonCardView } from "../tracker-accounts-list-skeletonCard.view";
import { OverviewLayout } from "@aramiworks/ui";

const meta: Meta<typeof TrackerAccountsListSkeletonCardView> = {
  title: "tracker/accounts/list/skeletonCard.view",
  component: TrackerAccountsListSkeletonCardView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=241-5",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerAccountsListSkeletonCardView>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker-accounts-list-skeletonCard.view"
      variants={[
        {
          name: "default",
          render: () => <TrackerAccountsListSkeletonCardView />,
        },
      ]}
    />
  ),
};
