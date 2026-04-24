import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TrackerErrorStateView } from "./tracker-errorState.view";

describe("TrackerErrorStateView", () => {
  it("renders with default translation keys", () => {
    const { getByText } = render(
      <TrackerErrorStateView testID="error-state" />,
    );
    expect(getByText("dashboard.errorState.title")).toBeTruthy();
    expect(getByText("dashboard.errorState.subtitle")).toBeTruthy();
    expect(getByText("dashboard.errorState.retry")).toBeTruthy();
  });

  it("calls onRetry when retry button is pressed", () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <TrackerErrorStateView testID="error-state" onRetry={onRetry} />,
    );
    fireEvent.press(getByTestId("error-state-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

void React;
