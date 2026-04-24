import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TrackerAccountsListSkeletonCardView } from "./tracker-accounts-list-skeletonCard.view";

jest.mock("@/experiences/tracker/views", () => ({
  TrackerSkeletonCardView: (props: Record<string, unknown>) =>
    require("react").createElement(require("react-native").View, {
      testID: "skeleton-card",
      width: props.width,
      height: props.height,
    }),
}));

describe("TrackerAccountsListSkeletonCardView", () => {
  it("renders skeleton card", () => {
    render(<TrackerAccountsListSkeletonCardView />);
    expect(screen.getByTestId("skeleton-card")).toBeTruthy();
  });
});
