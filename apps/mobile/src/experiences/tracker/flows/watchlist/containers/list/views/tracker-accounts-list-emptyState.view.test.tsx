import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TrackerAccountsListEmptyStateView } from "./tracker-accounts-list-emptyState.view";

jest.mock("@/experiences/tracker/views", () => ({
  TrackerEmptyStateView: (props: Record<string, unknown>) =>
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

describe("TrackerAccountsListEmptyStateView", () => {
  it("renders empty state with translated title", () => {
    render(<TrackerAccountsListEmptyStateView />);
    expect(screen.getByTestId("accounts-list-empty-state")).toBeTruthy();
    expect(screen.getByText("accounts.list.emptyState.title")).toBeTruthy();
  });

  it("passes onCtaPress handler", () => {
    const onCtaPress = jest.fn();
    render(<TrackerAccountsListEmptyStateView onCtaPress={onCtaPress} />);
    expect(screen.getByTestId("accounts-list-empty-state")).toBeTruthy();
  });
});
