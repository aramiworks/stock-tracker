import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AuthSignInGmailOauthHeaderView } from "./auth-signIn-gmailOauth-header.view";

const meta: Meta<typeof AuthSignInGmailOauthHeaderView> = {
  title: "auth/signIn/gmailOauth/views/header",
  component: AuthSignInGmailOauthHeaderView,
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=764-5",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AuthSignInGmailOauthHeaderView>;

export const Default: Story = {};
