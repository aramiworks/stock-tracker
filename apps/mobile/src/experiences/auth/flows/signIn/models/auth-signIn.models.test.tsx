import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { AuthSignInModels } from "./auth-signIn.models";

describe("AuthSignInModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <AuthSignInModels>
        <Text>child</Text>
      </AuthSignInModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
