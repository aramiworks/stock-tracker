import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TrackerHistoryBrowsePurchaseRowView } from "./tracker-history-browse-purchaseRow.view";

jest.mock("@/experiences/tracker/views", () => ({
  TrackerPurchaseRowView: (props: Record<string, unknown>) => {
    const { View, Text } = require("react-native");
    return (
      <View testID="purchase-row">
        <Text>{props.productName as string}</Text>
      </View>
    );
  },
}));

describe("TrackerHistoryBrowsePurchaseRowView", () => {
  it("renders the purchase row", () => {
    const { getByTestId } = render(
      <TrackerHistoryBrowsePurchaseRowView productName="Tank Francaise" />,
    );
    expect(getByTestId("purchase-row")).toBeTruthy();
  });

  it("calls onLongPress when long pressed", () => {
    const onLongPress = jest.fn();
    const { getByText } = render(
      <TrackerHistoryBrowsePurchaseRowView
        productName="Tank Francaise"
        onLongPress={onLongPress}
      />,
    );
    fireEvent(getByText("Tank Francaise"), "longPress");
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});

void React;
