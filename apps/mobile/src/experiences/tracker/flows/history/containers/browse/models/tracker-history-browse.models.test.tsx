import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerHistoryBrowseModels } from "./tracker-history-browse.models";

describe("TrackerHistoryBrowseModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerHistoryBrowseModels>
        <Text>child</Text>
      </TrackerHistoryBrowseModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
