import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerAccountsModels } from "./tracker-accounts.models";

describe("TrackerAccountsModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerAccountsModels>
        <Text>child</Text>
      </TrackerAccountsModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
