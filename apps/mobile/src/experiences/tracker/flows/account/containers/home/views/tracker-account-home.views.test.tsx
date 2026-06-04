import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

import { TrackerAccountHomeViews } from "./tracker-account-home.views";

describe("TrackerAccountHomeViews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders default state with account info, sign-out button, and version footer", () => {
    const { getByTestId } = render(
      <TrackerAccountHomeViews
        screenState="default"
        email="user@test.com"
        createdAt="2024-01-15T00:00:00Z"
      />,
    );
    expect(getByTestId("account-home-screen")).toBeTruthy();
    expect(getByTestId("account-info-card")).toBeTruthy();
    expect(getByTestId("sign-out-button")).toBeTruthy();
    expect(getByTestId("version-footer")).toBeTruthy();
  });

  it("renders the loading state", () => {
    const { getByTestId, queryByTestId } = render(
      <TrackerAccountHomeViews screenState="loading" />,
    );
    expect(getByTestId("account-home-loading-card")).toBeTruthy();
    expect(queryByTestId("account-info-card")).toBeNull();
  });

  it("renders the error state and forwards onRetry", () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <TrackerAccountHomeViews screenState="error" onRetry={onRetry} />,
    );
    expect(getByTestId("account-home-error-state")).toBeTruthy();
    fireEvent.press(getByTestId("account-home-error-state-retry"));
    expect(onRetry).toHaveBeenCalled();
  });

  it("calls signOut when sign-out button pressed", () => {
    const mockSignOut = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <TrackerAccountHomeViews signOut={mockSignOut} />,
    );
    fireEvent.press(getByTestId("sign-out-button"));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("calls router.back when navigation icon pressed", () => {
    const { getByTestId } = render(<TrackerAccountHomeViews />);
    fireEvent.press(getByTestId("account-home-top-bar-back"));
    expect(mockBack).toHaveBeenCalled();
  });

  it("falls back to default state when screenState is omitted", () => {
    const { getByTestId } = render(<TrackerAccountHomeViews />);
    expect(getByTestId("account-info-card")).toBeTruthy();
  });
});
