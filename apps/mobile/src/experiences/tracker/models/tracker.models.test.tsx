import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerModels } from "./tracker.models";

describe("TrackerModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerModels>
        <Text>child</Text>
      </TrackerModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
