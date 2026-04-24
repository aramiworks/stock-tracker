import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TrackerHistoryBrowseErrorStateView } from "./tracker-history-browse-errorState.view";

jest.mock("@/experiences/tracker/views", () => ({
  TrackerErrorStateView: (props: Record<string, unknown>) => {
    const { View, Text, Pressable } = require("react-native");
    return (
      <View testID={props.testID as string}>
        <Text>{props.title as string}</Text>
        <Text>{props.subtitle as string}</Text>
        <Pressable testID="retry-button" onPress={props.onRetry as () => void}>
          <Text>{props.retryLabel as string}</Text>
        </Pressable>
      </View>
    );
  },
}));

describe("TrackerHistoryBrowseErrorStateView", () => {
  it("renders the error state with translation keys", () => {
    const { getByTestId, getByText } = render(
      <TrackerHistoryBrowseErrorStateView />,
    );
    expect(getByTestId("history-browse-error-state")).toBeTruthy();
    expect(getByText("history.browse.errorState.title")).toBeTruthy();
    expect(getByText("history.browse.errorState.subtitle")).toBeTruthy();
    expect(getByText("history.browse.errorState.retry")).toBeTruthy();
  });

  it("calls onRetry when retry button is pressed", () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <TrackerHistoryBrowseErrorStateView onRetry={onRetry} />,
    );
    fireEvent.press(getByTestId("retry-button"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

void React;
