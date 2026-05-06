import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { TrackerDashboardHomeEmptyStateView } from "./tracker-dashboard-home-emptyState.view";

jest.mock("@/experiences/tracker/views", () => ({
  TrackerEmptyStateView: (props: Record<string, unknown>) =>
    require("react").createElement(require("react-native").View, {
      testID: "empty-state",
      onPress: props.onCtaPress,
    }),
}));

describe("TrackerDashboardHomeEmptyStateView", () => {
  it("renders the empty state", () => {
    render(<TrackerDashboardHomeEmptyStateView />);
    expect(screen.getByTestId("empty-state")).toBeTruthy();
  });

  it("calls onCtaPress when CTA is pressed", () => {
    const onCtaPress = jest.fn();
    render(<TrackerDashboardHomeEmptyStateView onCtaPress={onCtaPress} />);
    fireEvent(screen.getByTestId("empty-state"), "press");
    expect(onCtaPress).toHaveBeenCalledTimes(1);
  });
});
