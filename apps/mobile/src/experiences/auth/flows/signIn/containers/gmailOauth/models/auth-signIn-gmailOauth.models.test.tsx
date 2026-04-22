import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { AuthSignInGmailOauthModels } from "./auth-signIn-gmailOauth.models";

describe("AuthSignInGmailOauthModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <AuthSignInGmailOauthModels>
        <Text>child</Text>
      </AuthSignInGmailOauthModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
