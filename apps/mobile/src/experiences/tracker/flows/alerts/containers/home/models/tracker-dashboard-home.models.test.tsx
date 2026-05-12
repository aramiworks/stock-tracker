import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerDashboardHomeModels } from "./tracker-dashboard-home.models";

describe("TrackerDashboardHomeModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerDashboardHomeModels>
        <Text>child</Text>
      </TrackerDashboardHomeModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
