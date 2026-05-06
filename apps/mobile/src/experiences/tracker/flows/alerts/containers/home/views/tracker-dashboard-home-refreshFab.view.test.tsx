import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { TrackerDashboardHomeRefreshFabView } from "./tracker-dashboard-home-refreshFab.view";

describe("TrackerDashboardHomeRefreshFabView", () => {
  it("renders the FAB with correct testID", () => {
    render(<TrackerDashboardHomeRefreshFabView />);
    expect(screen.getByTestId("refresh-fab")).toBeTruthy();
  });

  it("calls onPress when FAB is pressed", () => {
    const onPress = jest.fn();
    render(<TrackerDashboardHomeRefreshFabView onPress={onPress} />);
    fireEvent(screen.getByTestId("refresh-fab"), "press");
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders with accessibility label", () => {
    render(<TrackerDashboardHomeRefreshFabView />);
    expect(screen.getByLabelText("새로고침")).toBeTruthy();
  });
});
