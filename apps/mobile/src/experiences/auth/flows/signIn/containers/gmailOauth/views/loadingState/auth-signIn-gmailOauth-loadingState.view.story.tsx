import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AuthSignInGmailOauthLoadingStateView } from "./auth-signIn-gmailOauth-loadingState.view";

const meta: Meta<typeof AuthSignInGmailOauthLoadingStateView> = {
  title: "auth/signIn/gmailOauth/views/loadingState",
  component: AuthSignInGmailOauthLoadingStateView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=764-5",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AuthSignInGmailOauthLoadingStateView>;

export const Default: Story = {};
