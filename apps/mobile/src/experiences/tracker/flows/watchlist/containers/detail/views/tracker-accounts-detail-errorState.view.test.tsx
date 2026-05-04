import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TrackerAccountsDetailErrorStateView } from "./tracker-accounts-detail-errorState.view";

jest.mock("@/experiences/tracker/views", () => ({
  TrackerErrorStateView: (props: Record<string, unknown>) =>
    require("react").createElement(
      require("react-native").View,
      { testID: props.testID },
      require("react").createElement(
        require("react-native").Text,
        null,
        props.title,
      ),
    ),
}));

describe("TrackerAccountsDetailErrorStateView", () => {
  it("renders error state with translated title", () => {
    render(<TrackerAccountsDetailErrorStateView />);
    expect(screen.getByTestId("accounts-detail-error-state")).toBeTruthy();
    expect(screen.getByText("accounts.detail.errorState.title")).toBeTruthy();
  });

  it("passes onRetry handler", () => {
    const onRetry = jest.fn();
    render(<TrackerAccountsDetailErrorStateView onRetry={onRetry} />);
    expect(screen.getByTestId("accounts-detail-error-state")).toBeTruthy();
  });
});
