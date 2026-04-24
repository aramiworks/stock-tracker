import React from "react";
import { render } from "@testing-library/react-native";

jest.mock("@aramiworks/ui", () => {
  const { View, Text: RNText } = require("react-native");
  const React = require("react");
  const passthrough = (props: Record<string, unknown>) => {
    const { children, ...rest } = props;
    return React.createElement(View, rest as object, children);
  };
  return {
    XStack: passthrough,
    YStack: passthrough,
    Text: (props: Record<string, unknown>) =>
      React.createElement(RNText, props, props.children),
  };
});

import { TrackerPurchaseRowView } from "./tracker-purchaseRow.view";

describe("TrackerPurchaseRowView", () => {
  it("renders with default props and formatted amount", () => {
    const { getByText } = render(
      <TrackerPurchaseRowView testID="purchase-row" />,
    );
    expect(getByText("트리니티 링")).toBeTruthy();
    expect(getByText("+₩3,200,000")).toBeTruthy();
    expect(getByText("2024.03.15")).toBeTruthy();
  });

  it("renders tank type with teal accent bar", () => {
    const { UNSAFE_root } = render(
      <TrackerPurchaseRowView type="tank" testID="purchase-row" />,
    );
    const nodes = UNSAFE_root.findAll(
      (node) =>
        node.props.backgroundColor === "#009E99" && node.props.width === 4,
    );
    expect(nodes.length).toBeGreaterThan(0);
  });

  it("regular type does not have teal accent bar", () => {
    const { UNSAFE_root } = render(
      <TrackerPurchaseRowView type="regular" testID="purchase-row" />,
    );
    const nodes = UNSAFE_root.findAll(
      (node) =>
        node.props.backgroundColor === "#009E99" && node.props.width === 4,
    );
    expect(nodes.length).toBe(0);
  });
});

void React;
