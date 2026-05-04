import React from "react";
import { render } from "@testing-library/react-native";
import { TrackerSkeletonCardView } from "./tracker-skeletonCard.view";

describe("TrackerSkeletonCardView", () => {
  it("renders without children", () => {
    const { toJSON } = render(<TrackerSkeletonCardView />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders with custom testID", () => {
    const { getByTestId } = render(
      <TrackerSkeletonCardView testID="custom-skeleton" />,
    );
    expect(getByTestId("custom-skeleton")).toBeTruthy();
  });
});

void React;
