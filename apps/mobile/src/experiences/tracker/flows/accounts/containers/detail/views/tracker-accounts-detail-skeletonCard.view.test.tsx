import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TrackerAccountsDetailSkeletonCardView } from "./tracker-accounts-detail-skeletonCard.view";

jest.mock("@/experiences/tracker/views", () => ({
  TrackerSkeletonCardView: (props: Record<string, unknown>) =>
    require("react").createElement(require("react-native").View, {
      testID: "skeleton-card",
      width: props.width,
      height: props.height,
    }),
}));

describe("TrackerAccountsDetailSkeletonCardView", () => {
  it("renders skeleton card", () => {
    render(<TrackerAccountsDetailSkeletonCardView />);
    expect(screen.getByTestId("skeleton-card")).toBeTruthy();
  });
});
