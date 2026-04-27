import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useConfirmDialog } from "@aramiworks/ui";

// Mock child views — each rendered as a simple testID stub so we can assert
// template wiring without depending on their internals.
// jest.mock factories run before imports, so RN must be required inline (INF-1058).
jest.mock("./tracker-accounts-list-saListItem.view", () => ({
  TrackerAccountsListSaListItemView: (props: {
    id: string;
    onPress?: () => void;
    onLongPress?: () => void;
  }) =>
    require("react").createElement(require("react-native").View, {
      testID: `sa-list-item-${props.id}`,
      onPress: props.onPress,
      onLongPress: props.onLongPress,
    }),
}));
jest.mock("./tracker-accounts-list-emptyState.view", () => ({
  TrackerAccountsListEmptyStateView: (props: { onCtaPress?: () => void }) =>
    require("react").createElement(require("react-native").View, {
      testID: "empty-state",
      onPress: props.onCtaPress,
    }),
}));
jest.mock("./tracker-accounts-list-errorState.view", () => ({
  TrackerAccountsListErrorStateView: (props: { onRetry?: () => void }) =>
    require("react").createElement(require("react-native").View, {
      testID: "error-state",
      onPress: props.onRetry,
    }),
}));
jest.mock("./tracker-accounts-list-skeletonCard.view", () => ({
  TrackerAccountsListSkeletonCardView: () =>
    require("react").createElement(require("react-native").View, {
      testID: "skeleton-card",
    }),
}));
jest.mock("./tracker-accounts-list-sortToggle.view", () => ({
  TrackerAccountsListSortToggleView: (props: { onToggle?: () => void }) =>
    require("react").createElement(require("react-native").View, {
      testID: "sort-toggle",
      onPress: props.onToggle,
    }),
}));
jest.mock("@/experiences/tracker/views/tracker-accountFormModal.view", () => ({
  TrackerAccountFormModalView: (props: {
    visible: boolean;
    onClose?: () => void;
  }) =>
    props.visible
      ? require("react").createElement(require("react-native").View, {
          testID: "account-form-modal",
          onPress: props.onClose,
        })
      : null,
}));

import { TrackerAccountsListViews } from "./tracker-accounts-list.views";

const account = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  state: "eligible" as const,
  name: `SA ${id}`,
  initial: "S",
  boutique: `Boutique ${id}`,
  totalSpend: 1000,
  ...overrides,
});

describe("TrackerAccountsListViews", () => {
  it("renders default screen with title, sa list items, and add FAB", () => {
    const { getByTestId } = render(
      <TrackerAccountsListViews
        screenState="default"
        accounts={[account("1"), account("2")]}
      />,
    );
    expect(getByTestId("accounts-list-screen")).toBeTruthy();
    expect(getByTestId("accounts-list-title")).toBeTruthy();
    expect(getByTestId("sa-list-item-1")).toBeTruthy();
    expect(getByTestId("sa-list-item-2")).toBeTruthy();
    expect(getByTestId("add-account-fab")).toBeTruthy();
  });

  it("uses the storybook default accounts when none are provided", () => {
    const { getByTestId } = render(<TrackerAccountsListViews />);
    expect(getByTestId("sa-list-item-1")).toBeTruthy();
    expect(getByTestId("sa-list-item-5")).toBeTruthy();
  });

  it("renders empty state + add FAB", () => {
    const { getByTestId } = render(
      <TrackerAccountsListViews screenState="empty" />,
    );
    expect(getByTestId("empty-state")).toBeTruthy();
    expect(getByTestId("add-account-fab")).toBeTruthy();
  });

  it("renders loading skeletons and hides FAB", () => {
    const { getAllByTestId, queryByTestId } = render(
      <TrackerAccountsListViews screenState="loading" />,
    );
    expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
    expect(queryByTestId("add-account-fab")).toBeNull();
  });

  it("renders error state, hides FAB, and hides search/sort header", () => {
    const { getByTestId, queryByTestId } = render(
      <TrackerAccountsListViews
        screenState="error"
        onRetry={jest.fn()}
        onSearchChange={jest.fn()}
        onSortByToggle={jest.fn()}
      />,
    );
    expect(getByTestId("error-state")).toBeTruthy();
    expect(queryByTestId("add-account-fab")).toBeNull();
    expect(queryByTestId("accounts-list-search")).toBeNull();
    expect(queryByTestId("sort-toggle-bar")).toBeNull();
  });

  it("renders SearchBar + SortToggle only when handlers are provided", () => {
    const { getByTestId, queryByTestId, rerender } = render(
      <TrackerAccountsListViews screenState="default" />,
    );
    expect(queryByTestId("accounts-list-search")).toBeNull();
    expect(queryByTestId("sort-toggle-bar")).toBeNull();
    rerender(
      <TrackerAccountsListViews
        screenState="default"
        onSearchChange={jest.fn()}
        onSortByToggle={jest.fn()}
      />,
    );
    expect(getByTestId("accounts-list-search")).toBeTruthy();
    expect(getByTestId("sort-toggle-bar")).toBeTruthy();
  });

  it("invokes onSaPress with the tapped account id", () => {
    const onSaPress = jest.fn();
    const { getByTestId } = render(
      <TrackerAccountsListViews
        screenState="default"
        accounts={[account("abc")]}
        onSaPress={onSaPress}
      />,
    );
    fireEvent.press(getByTestId("sa-list-item-abc"));
    expect(onSaPress).toHaveBeenCalledWith("abc");
  });

  it("does not throw on press when onSaPress is undefined (optional chaining)", () => {
    const { getByTestId } = render(
      <TrackerAccountsListViews
        screenState="default"
        accounts={[account("x")]}
      />,
    );
    expect(() =>
      fireEvent(getByTestId("sa-list-item-x"), "press"),
    ).not.toThrow();
  });

  it("opens delete confirm dialog when long-pressing with onDeleteAccount wired", () => {
    const onDeleteAccount = jest.fn().mockResolvedValue(undefined);
    const { showConfirmDialog } = useConfirmDialog();
    (showConfirmDialog as jest.Mock).mockClear();
    const { getByTestId } = render(
      <TrackerAccountsListViews
        screenState="default"
        accounts={[account("del")]}
        onDeleteAccount={onDeleteAccount}
      />,
    );
    fireEvent(getByTestId("sa-list-item-del"), "longPress");
    expect(showConfirmDialog).toHaveBeenCalledTimes(1);
    const options = (showConfirmDialog as jest.Mock).mock.calls[0][0];
    expect(options.confirmLabel).toBe("삭제");
    expect(options.dismissLabel).toBe("취소");
    options.onConfirm();
    expect(onDeleteAccount).toHaveBeenCalledWith("del");
  });

  it("does not wire onLongPress when onDeleteAccount is absent", () => {
    const { showConfirmDialog } = useConfirmDialog();
    (showConfirmDialog as jest.Mock).mockClear();
    const { getByTestId } = render(
      <TrackerAccountsListViews
        screenState="default"
        accounts={[account("plain")]}
      />,
    );
    fireEvent(getByTestId("sa-list-item-plain"), "longPress");
    expect(showConfirmDialog).not.toHaveBeenCalled();
  });

  it("opens and closes the account form modal via add FAB", () => {
    const { getByTestId, queryByTestId } = render(
      <TrackerAccountsListViews
        screenState="default"
        accounts={[]}
        onCreateAccount={jest.fn()}
      />,
    );
    expect(queryByTestId("account-form-modal")).toBeNull();
    fireEvent.press(getByTestId("add-account-fab"));
    expect(getByTestId("account-form-modal")).toBeTruthy();
    fireEvent.press(getByTestId("account-form-modal"));
    expect(queryByTestId("account-form-modal")).toBeNull();
  });

  it("opens the modal via empty-state CTA", () => {
    const { getByTestId, queryByTestId } = render(
      <TrackerAccountsListViews
        screenState="empty"
        onCreateAccount={jest.fn()}
      />,
    );
    expect(queryByTestId("account-form-modal")).toBeNull();
    fireEvent.press(getByTestId("empty-state"));
    expect(getByTestId("account-form-modal")).toBeTruthy();
  });
});

// Silence unused React warning from the import used for JSX.
void React;
