import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AuthSignInGmailOauthWelcomeHeadingView } from "./auth-signIn-gmailOauth-welcomeHeading.view";

const meta: Meta<typeof AuthSignInGmailOauthWelcomeHeadingView> = {
  title: "auth/signIn/gmailOauth/views/welcomeHeading",
  component: AuthSignInGmailOauthWelcomeHeadingView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=764-5",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AuthSignInGmailOauthWelcomeHeadingView>;

export const Default: Story = {};
