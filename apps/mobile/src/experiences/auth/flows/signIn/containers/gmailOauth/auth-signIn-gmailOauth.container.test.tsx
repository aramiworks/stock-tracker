jest.mock("./models", () => ({
  AuthSignInGmailOauthModels: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock("./controllers", () => ({
  AuthSignInGmailOauthControllers: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
  useAuthSignInGmailOauthControllers: () => ({
    signInWithGoogle: jest.fn(),
    isSigningIn: false,
    signInError: false,
  }),
}));

jest.mock("./views", () => ({
  AuthSignInGmailOauthViews: () => "GmailOauthViews",
}));

import React from "react";
import { render } from "@testing-library/react-native";
import { AuthSignInGmailOauthContainer } from "./auth-signIn-gmailOauth.container";

describe("AuthSignInGmailOauthContainer", () => {
  it("composes Models > Controllers > Views", () => {
    const { toJSON } = render(<AuthSignInGmailOauthContainer />);
    expect(toJSON()).toBe("GmailOauthViews");
  });
});
