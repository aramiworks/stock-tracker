import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AuthSignInGmailOauthTermsView } from "./auth-signIn-gmailOauth-terms.view";

const meta: Meta<typeof AuthSignInGmailOauthTermsView> = {
  title: "auth/signIn/gmailOauth/views/terms",
  component: AuthSignInGmailOauthTermsView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=764-5",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AuthSignInGmailOauthTermsView>;

export const Default: Story = {};
