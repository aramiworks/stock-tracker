import React from "react";
import { render } from "@testing-library/react-native";
import { TrackerHistoryBrowseEmptyStateView } from "./tracker-history-browse-emptyState.view";

jest.mock("@/experiences/tracker/views", () => ({
  TrackerEmptyStateView: (props: Record<string, unknown>) => {
    const { View, Text } = require("react-native");
    return (
      <View testID={props.testID as string}>
        <Text>{props.title as string}</Text>
        <Text>{props.subtitle as string}</Text>
        <Text>{props.ctaLabel as string}</Text>
      </View>
    );
  },
}));

describe("TrackerHistoryBrowseEmptyStateView", () => {
  it("renders the empty state with translation keys", () => {
    const { getByTestId, getByText } = render(
      <TrackerHistoryBrowseEmptyStateView />,
    );
    expect(getByTestId("history-browse-empty-state")).toBeTruthy();
    expect(getByText("history.browse.emptyState.title")).toBeTruthy();
    expect(getByText("history.browse.emptyState.subtitle")).toBeTruthy();
    expect(getByText("history.browse.emptyState.cta")).toBeTruthy();
  });
});

void React;
