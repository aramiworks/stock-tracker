import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerHistoryModels } from "./tracker-history.models";

describe("TrackerHistoryModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerHistoryModels>
        <Text>child</Text>
      </TrackerHistoryModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
