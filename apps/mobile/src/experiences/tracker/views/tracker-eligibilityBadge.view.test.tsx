import React from "react";
import { render } from "@testing-library/react-native";

jest.mock("@aramiworks/ui", () => {
  const { View, Text: RNText } = require("react-native");
  const React = require("react");
  return {
    XStack: (props: Record<string, unknown>) =>
      React.createElement(View, { testID: props.testID }, props.children),
    Text: (props: Record<string, unknown>) =>
      React.createElement(RNText, props, props.children),
  };
});

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
