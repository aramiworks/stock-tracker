import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { useAuthLifecycle } from "../lifecycles/auth.lifecycles";
import { AuthModels } from "./auth.models";

jest.mock("../lifecycles/auth.lifecycles", () => ({
  useAuthLifecycle: jest.fn(),
}));

describe("AuthModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <AuthModels>
        <Text>child</Text>
      </AuthModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });

  it("calls useAuthLifecycle", () => {
    render(
      <AuthModels>
        <Text>child</Text>
      </AuthModels>,
    );
    expect(useAuthLifecycle).toHaveBeenCalled();
  });
});
