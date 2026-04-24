import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TrackerEmptyStateView } from "./tracker-emptyState.view";

describe("TrackerEmptyStateView", () => {
  it("renders with default title from translation key", () => {
    const { getByText } = render(
      <TrackerEmptyStateView testID="empty-state" />,
    );
    expect(getByText("dashboard.emptyState.title")).toBeTruthy();
    expect(getByText("dashboard.emptyState.subtitle")).toBeTruthy();
    expect(getByText("dashboard.emptyState.cta")).toBeTruthy();
  });

  it("renders custom title and subtitle when provided", () => {
    const { getByText } = render(
      <TrackerEmptyStateView title="Custom Title" subtitle="Custom Subtitle" />,
    );
    expect(getByText("Custom Title")).toBeTruthy();
    expect(getByText("Custom Subtitle")).toBeTruthy();
  });

  it("calls onCtaPress when CTA button is pressed", () => {
    const onCtaPress = jest.fn();
    const { getByTestId } = render(
      <TrackerEmptyStateView testID="empty-state" onCtaPress={onCtaPress} />,
    );
    fireEvent.press(getByTestId("empty-state-cta"));
    expect(onCtaPress).toHaveBeenCalledTimes(1);
  });
});

void React;
