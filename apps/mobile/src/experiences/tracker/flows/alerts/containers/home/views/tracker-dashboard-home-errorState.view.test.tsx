import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { TrackerDashboardHomeErrorStateView } from "./tracker-dashboard-home-errorState.view";

jest.mock("@/experiences/tracker/views", () => ({
  TrackerErrorStateView: (props: Record<string, unknown>) =>
    require("react").createElement(require("react-native").View, {
      testID: "error-state",
      onPress: props.onRetry,
    }),
}));

describe("TrackerDashboardHomeErrorStateView", () => {
  it("renders the error state", () => {
    render(<TrackerDashboardHomeErrorStateView />);
    expect(screen.getByTestId("error-state")).toBeTruthy();
  });

  it("calls onRetry when retry is pressed", () => {
    const onRetry = jest.fn();
    render(<TrackerDashboardHomeErrorStateView onRetry={onRetry} />);
    fireEvent(screen.getByTestId("error-state"), "press");
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
