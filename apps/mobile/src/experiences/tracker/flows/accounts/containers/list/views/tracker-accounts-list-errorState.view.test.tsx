import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TrackerAccountsListErrorStateView } from "./tracker-accounts-list-errorState.view";

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

describe("TrackerAccountsListErrorStateView", () => {
  it("renders error state with translated title", () => {
    render(<TrackerAccountsListErrorStateView />);
    expect(screen.getByTestId("accounts-list-error-state")).toBeTruthy();
    expect(screen.getByText("accounts.list.errorState.title")).toBeTruthy();
  });

  it("passes onRetry handler", () => {
    const onRetry = jest.fn();
    render(<TrackerAccountsListErrorStateView onRetry={onRetry} />);
    expect(screen.getByTestId("accounts-list-error-state")).toBeTruthy();
  });
});
