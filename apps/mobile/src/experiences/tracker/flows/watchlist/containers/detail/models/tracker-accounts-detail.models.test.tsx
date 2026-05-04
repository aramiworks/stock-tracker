import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerAccountsDetailModels } from "./tracker-accounts-detail.models";

describe("TrackerAccountsDetailModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerAccountsDetailModels>
        <Text>child</Text>
      </TrackerAccountsDetailModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
