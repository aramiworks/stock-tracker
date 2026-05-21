import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OverviewLayout } from "@aramiworks/ui";
import { AuthSignInGmailOauthViews } from "../views/auth-signIn-gmailOauth.views";

const meta: Meta<typeof AuthSignInGmailOauthViews> = {
  title: "auth/signIn/gmailOauth",
  component: AuthSignInGmailOauthViews,
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/MSJ05A0BXBDTO0powtUMg3?node-id=764-5",
    },
  },
  argTypes: {
    screenState: {
      control: { type: "select" },
      options: ["default", "loading", "error"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AuthSignInGmailOauthViews>;

export const Default: Story = { args: { screenState: "default" } };
export const Loading: Story = { args: { screenState: "loading" } };
export const Error: Story = { args: { screenState: "error" } };

export const Overview: Story = {
  render: () => (
    <OverviewLayout
      viewName="auth-signIn-gmailOauth"
      variants={[
        {
          name: "default",
          render: () => <AuthSignInGmailOauthViews screenState="default" />,
        },
        {
          name: "loading",
          render: () => <AuthSignInGmailOauthViews screenState="loading" />,
        },
        {
          name: "error",
          render: () => <AuthSignInGmailOauthViews screenState="error" />,
        },
      ]}
    />
  ),
};
