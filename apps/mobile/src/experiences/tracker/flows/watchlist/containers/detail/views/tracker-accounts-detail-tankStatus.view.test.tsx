import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TrackerAccountsDetailTankStatusView } from "./tracker-accounts-detail-tankStatus.view";

jest.mock("@/experiences/tracker/views", () => ({
  TrackerEligibilityBadgeView: (props: Record<string, unknown>) =>
    require("react").createElement(
      require("react-native").View,
      { testID: props.testID },
      require("react").createElement(
        require("react-native").Text,
        null,
        props.status,
      ),
    ),
}));

describe("TrackerAccountsDetailTankStatusView", () => {
  it("renders with eligible state", () => {
    render(
      <TrackerAccountsDetailTankStatusView
        state="eligible"
        testID="tank-status"
      />,
    );
    expect(screen.getByTestId("tank-status")).toBeTruthy();
    expect(screen.getByText("eligible")).toBeTruthy();
  });

  it("renders with notEligible state", () => {
    render(<TrackerAccountsDetailTankStatusView state="notEligible" />);
    expect(screen.getByText("notEligible")).toBeTruthy();
  });

  it("defaults to eligible when no state prop", () => {
    render(<TrackerAccountsDetailTankStatusView />);
    expect(screen.getByText("eligible")).toBeTruthy();
  });
});
