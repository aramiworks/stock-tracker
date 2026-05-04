import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TrackerDashboardHomeEligibilityBadgeView } from "./tracker-dashboard-home-eligibilityBadge.view";

jest.mock("@/experiences/tracker/views", () => ({
  TrackerEligibilityBadgeView: (props: Record<string, unknown>) =>
    require("react").createElement(require("react-native").View, {
      testID: `badge-${props.status}`,
    }),
}));

describe("TrackerDashboardHomeEligibilityBadgeView", () => {
  it("renders with eligible state by default", () => {
    render(<TrackerDashboardHomeEligibilityBadgeView />);
    expect(screen.getByTestId("badge-eligible")).toBeTruthy();
  });

  it("renders with notEligible state", () => {
    render(<TrackerDashboardHomeEligibilityBadgeView state="notEligible" />);
    expect(screen.getByTestId("badge-notEligible")).toBeTruthy();
  });

  it("maps state prop to status prop on inner view", () => {
    render(<TrackerDashboardHomeEligibilityBadgeView state="eligible" />);
    expect(screen.getByTestId("badge-eligible")).toBeTruthy();
  });
});
