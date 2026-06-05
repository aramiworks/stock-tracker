import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AuthSignInGmailOauthErrorStateView } from "./auth-signIn-gmailOauth-errorState.view";

const meta: Meta<typeof AuthSignInGmailOauthErrorStateView> = {
  title: "auth/signIn/gmailOauth/views/errorState",
  component: AuthSignInGmailOauthErrorStateView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=764-5",
    },
  },
  argTypes: {
    onRetry: { action: "retry" },
  },
};

export default meta;
type Story = StoryObj<typeof AuthSignInGmailOauthErrorStateView>;

export const Default: Story = {};
