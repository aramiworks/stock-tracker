import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TrackerErrorStateView } from "../tracker-errorState.view";

const meta: Meta<typeof TrackerErrorStateView> = {
  title: "tracker/views/errorState",
  component: TrackerErrorStateView,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof TrackerErrorStateView>;

export const Default: Story = {
  args: {
    title: "데이터를 불러올 수 없습니다",
    subtitle: "네트워크 연결을 확인하고 다시 시도해주세요",
    retryLabel: "다시 시도",
  },
};
