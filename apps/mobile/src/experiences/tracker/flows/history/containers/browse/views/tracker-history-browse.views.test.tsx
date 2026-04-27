import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useConfirmDialog } from "@aramiworks/ui";

// Mock child views. jest.mock factories run before imports — RN must be
// required inline to avoid out-of-scope reference errors (INF-1058).
jest.mock("./tracker-history-browse-dateFilterChips.view", () => ({
  TrackerHistoryBrowseDateFilterChipsView: (props: {
    onSelect?: (f: string) => void;
  }) =>
    require("react").createElement(require("react-native").View, {
      testID: "date-filter-chips",
      onPress: () => props.onSelect?.("all"),
    }),
}));
jest.mock("./tracker-history-browse-categoryFilterChips.view", () => ({
  TrackerHistoryBrowseCategoryFilterChipsView: (props: {
    onSelect?: (c: string | null) => void;
  }) =>
    require("react").createElement(require("react-native").View, {
      testID: "category-filter-chips",
      onPress: () => props.onSelect?.(null),
    }),
}));
jest.mock("./tracker-history-browse-purchaseRow.view", () => ({
  TrackerHistoryBrowsePurchaseRowView: (props: {
    productName: string;
    onLongPress?: () => void;
  }) =>
    require("react").createElement(require("react-native").View, {
      testID: `purchase-row-${props.productName}`,
      onLongPress: props.onLongPress,
    }),
}));
jest.mock("./tracker-history-browse-emptyState.view", () => ({
  TrackerHistoryBrowseEmptyStateView: () =>
    require("react").createElement(require("react-native").View, {
      testID: "empty-state",
    }),
}));
jest.mock("./tracker-history-browse-errorState.view", () => ({
  TrackerHistoryBrowseErrorStateView: (props: { onRetry?: () => void }) =>
    require("react").createElement(require("react-native").View, {
      testID: "error-state",
      onPress: props.onRetry,
    }),
}));
jest.mock("./tracker-history-browse-skeletonCard.view", () => ({
  TrackerHistoryBrowseSkeletonCardView: () =>
    require("react").createElement(require("react-native").View, {
      testID: "skeleton-card",
    }),
}));

import { TrackerHistoryBrowseViews } from "./tracker-history-browse.views";

const purchase = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  type: "regular" as const,
  productName: `Product ${id}`,
  date: "2024.03.15 · SA",
  amount: 1000,
  ...overrides,
});

describe("TrackerHistoryBrowseViews", () => {
  const { showConfirmDialog } = useConfirmDialog();
  beforeEach(() => {
    (showConfirmDialog as jest.Mock).mockClear();
  });

  it("renders default screen with title and purchase rows", () => {
    const { getByTestId } = render(
      <TrackerHistoryBrowseViews
        screenState="default"
        purchases={[purchase("1"), purchase("2")]}
      />,
    );
    expect(getByTestId("history-browse-screen")).toBeTruthy();
    expect(getByTestId("history-browse-title")).toBeTruthy();
    expect(getByTestId("purchase-row-Product 1")).toBeTruthy();
    expect(getByTestId("purchase-row-Product 2")).toBeTruthy();
  });

  it("uses the storybook default purchases when none are provided", () => {
    const { getByTestId } = render(<TrackerHistoryBrowseViews />);
    expect(getByTestId("purchase-row-트리니티 링")).toBeTruthy();
    expect(getByTestId("purchase-row-러브 브레이슬릿")).toBeTruthy();
  });

  it("renders empty state", () => {
    const { getByTestId } = render(
      <TrackerHistoryBrowseViews screenState="empty" />,
    );
    expect(getByTestId("empty-state")).toBeTruthy();
  });

  it("renders loading skeletons", () => {
    const { getAllByTestId } = render(
      <TrackerHistoryBrowseViews screenState="loading" />,
    );
    expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
  });

  it("renders error state and hides search/filter header", () => {
    const { getByTestId, queryByTestId } = render(
      <TrackerHistoryBrowseViews
        screenState="error"
        onRetry={jest.fn()}
        onSearchChange={jest.fn()}
      />,
    );
    expect(getByTestId("error-state")).toBeTruthy();
    expect(queryByTestId("history-browse-search")).toBeNull();
    expect(queryByTestId("date-filter-bar")).toBeNull();
    expect(queryByTestId("category-filter-bar")).toBeNull();
  });

  it("renders SearchBar only when onSearchChange is wired", () => {
    const { queryByTestId, rerender } = render(
      <TrackerHistoryBrowseViews screenState="default" />,
    );
    expect(queryByTestId("history-browse-search")).toBeNull();
    rerender(
      <TrackerHistoryBrowseViews
        screenState="default"
        onSearchChange={jest.fn()}
      />,
    );
    expect(queryByTestId("history-browse-search")).toBeTruthy();
  });

  it("always renders date + category filter bars on non-error states", () => {
    const { getByTestId } = render(
      <TrackerHistoryBrowseViews screenState="default" />,
    );
    expect(getByTestId("date-filter-bar")).toBeTruthy();
    expect(getByTestId("category-filter-bar")).toBeTruthy();
  });

  it("forwards date and category selection to handlers", () => {
    const onFilterSelect = jest.fn();
    const onCategorySelect = jest.fn();
    const { getByTestId } = render(
      <TrackerHistoryBrowseViews
        screenState="default"
        onFilterSelect={onFilterSelect}
        onCategorySelect={onCategorySelect}
      />,
    );
    fireEvent.press(getByTestId("date-filter-chips"));
    fireEvent.press(getByTestId("category-filter-chips"));
    expect(onFilterSelect).toHaveBeenCalledWith("all");
    expect(onCategorySelect).toHaveBeenCalledWith(null);
  });

  it("opens delete confirm dialog when long-pressing with onDeletePurchase wired", () => {
    const onDeletePurchase = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <TrackerHistoryBrowseViews
        screenState="default"
        purchases={[purchase("del")]}
        onDeletePurchase={onDeletePurchase}
      />,
    );
    fireEvent(getByTestId("purchase-row-Product del"), "longPress");
    expect(showConfirmDialog).toHaveBeenCalledTimes(1);
    const options = (showConfirmDialog as jest.Mock).mock.calls[0][0];
    expect(options.confirmLabel).toBe("삭제");
    expect(options.dismissLabel).toBe("취소");
    options.onConfirm();
    expect(onDeletePurchase).toHaveBeenCalledWith("del");
  });

  it("does not wire onLongPress when onDeletePurchase is absent", () => {
    const { getByTestId } = render(
      <TrackerHistoryBrowseViews
        screenState="default"
        purchases={[purchase("plain")]}
      />,
    );
    fireEvent(getByTestId("purchase-row-Product plain"), "longPress");
    expect(showConfirmDialog).not.toHaveBeenCalled();
  });
});

// Silence unused React warning from the import used for JSX.
void React;
