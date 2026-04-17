import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";

jest.mock("tamagui", () => ({
  TamaguiProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

import { AppTamaguiProvider } from "./provider";

describe("AppTamaguiProvider", () => {
  it("renders children", () => {
    const { getByText } = render(
      <AppTamaguiProvider>
        <Text>hello</Text>
      </AppTamaguiProvider>,
    );
    expect(getByText("hello")).toBeTruthy();
  });
});
