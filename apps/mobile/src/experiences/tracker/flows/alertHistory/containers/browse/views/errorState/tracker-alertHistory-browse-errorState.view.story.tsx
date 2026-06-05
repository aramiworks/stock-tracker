import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerAlertHistoryBrowseErrorStateView } from "./tracker-alertHistory-browse-errorState.view";
import { OverviewLayout } from "@aramiworks/ui";

const noopRetry = () => undefined;

const meta: Meta<typeof TrackerAlertHistoryBrowseErrorStateView> = {
  title: "tracker/alertHistory/browse/errorState",
  component: TrackerAlertHistoryBrowseErrorStateView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=623-1216",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackerAlertHistoryBrowseErrorStateView>;

export const Default: Story = {
  args: { onRetry: noopRetry },
};

export const NoHandler: Story = {};

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="tracker/alertHistory/browse/errorState"
      variants={[
        {
          name: "default (figma 623:1216)",
          render: () => (
            <TrackerAlertHistoryBrowseErrorStateView onRetry={noopRetry} />
          ),
        },
        {
          name: "no retry handler",
          render: () => <TrackerAlertHistoryBrowseErrorStateView />,
        },
      ]}
    />
  ),
};
