import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerAccountsListModels } from "./tracker-accounts-list.models";

describe("TrackerAccountsListModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerAccountsListModels>
        <Text>child</Text>
      </TrackerAccountsListModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
