import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerDashboardModels } from "./tracker-dashboard.models";

describe("TrackerDashboardModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerDashboardModels>
        <Text>child</Text>
      </TrackerDashboardModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
