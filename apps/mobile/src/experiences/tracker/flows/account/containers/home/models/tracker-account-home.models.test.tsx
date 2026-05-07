import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerAccountHomeModels } from "./tracker-account-home.models";

describe("TrackerAccountHomeModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerAccountHomeModels>
        <Text>child</Text>
      </TrackerAccountHomeModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
