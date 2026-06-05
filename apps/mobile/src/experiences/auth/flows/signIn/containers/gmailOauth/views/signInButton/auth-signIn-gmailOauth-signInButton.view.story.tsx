import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AuthSignInGmailOauthSignInButtonView } from "./auth-signIn-gmailOauth-signInButton.view";

const meta: Meta<typeof AuthSignInGmailOauthSignInButtonView> = {
  title: "auth/signIn/gmailOauth/views/signInButton",
  component: AuthSignInGmailOauthSignInButtonView,
  parameters: {
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=764-5",
    },
  },
  argTypes: {
    onPress: { action: "pressed" },
    disabled: { control: { type: "boolean" } },
  },
};

export default meta;
type Story = StoryObj<typeof AuthSignInGmailOauthSignInButtonView>;

export const Default: Story = { args: { disabled: false } };
export const Disabled: Story = { args: { disabled: true } };
