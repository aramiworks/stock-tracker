import React from "react";
import { render } from "@testing-library/react-native";
import { TrackerHistoryBrowseSkeletonCardView } from "./tracker-history-browse-skeletonCard.view";

jest.mock("@/experiences/tracker/views", () => ({
  TrackerSkeletonCardView: (props: Record<string, unknown>) => {
    const { View } = require("react-native");
    return (
      <View
        testID="skeleton-card"
        style={{ width: props.width, height: props.height }}
      />
    );
  },
}));

describe("TrackerHistoryBrowseSkeletonCardView", () => {
  it("renders the skeleton card", () => {
    const { getByTestId } = render(<TrackerHistoryBrowseSkeletonCardView />);
    expect(getByTestId("skeleton-card")).toBeTruthy();
  });
});

void React;
