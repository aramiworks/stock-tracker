import React from "react";
import { render } from "@testing-library/react-native";
import { TrackerEligibilityBadgeView } from "./tracker-eligibilityBadge.view";

describe("TrackerEligibilityBadgeView", () => {
  it("renders with default eligible status and testID", () => {
    const { getByTestId } = render(<TrackerEligibilityBadgeView />);
    expect(getByTestId("eligibility-badge")).toBeTruthy();
  });

  it("renders eligible text", () => {
    const { getByText } = render(
      <TrackerEligibilityBadgeView status="eligible" />,
    );
    expect(getByText("eligibility.eligible")).toBeTruthy();
  });

  it("renders notEligible text", () => {
    const { getByText } = render(
      <TrackerEligibilityBadgeView status="notEligible" />,
    );
    expect(getByText("eligibility.notEligible")).toBeTruthy();
  });
});

void React;
