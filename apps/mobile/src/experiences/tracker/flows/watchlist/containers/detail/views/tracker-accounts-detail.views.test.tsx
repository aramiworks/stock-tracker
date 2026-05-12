import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

// Mock child views. jest.mock factories run before imports — RN must be
// required inline to avoid out-of-scope reference errors (INF-1058).
jest.mock("./tracker-accounts-detail-saHeader.view", () => ({
  TrackerAccountsDetailSaHeaderView: (props: { testID?: string }) =>
    require("react").createElement(require("react-native").View, {
      testID: props.testID,
    }),
}));
jest.mock("./tracker-accounts-detail-tankStatus.view", () => ({
  TrackerAccountsDetailTankStatusView: (props: {
    state: string;
    testID?: string;
  }) =>
    require("react").createElement(require("react-native").View, {
      testID: `${props.testID}-${props.state}`,
    }),
}));
jest.mock("./tracker-accounts-detail-purchaseRow.view", () => ({
  TrackerAccountsDetailPurchaseRowView: (props: {
    id: string;
    productName: string;
    onEdit?: () => void;
    onDelete?: () => void;
  }) =>
    require("react").createElement(require("react-native").View, {
      testID: `purchase-row-${props.id}`,
      onPress: props.onEdit,
      onLongPress: props.onDelete,
    }),
}));
jest.mock("./tracker-accounts-detail-errorState.view", () => ({
  TrackerAccountsDetailErrorStateView: (props: { onRetry?: () => void }) =>
    require("react").createElement(require("react-native").View, {
      testID: "error-state",
      onPress: props.onRetry,
    }),
}));
jest.mock("./tracker-accounts-detail-skeletonCard.view", () => ({
  TrackerAccountsDetailSkeletonCardView: () =>
    require("react").createElement(require("react-native").View, {
      testID: "skeleton-card",
    }),
}));
jest.mock("./tracker-accounts-detail-editAccountModal.view", () => ({
  TrackerAccountsDetailEditAccountModalView: (props: {
    visible: boolean;
    onClose?: () => void;
    onSubmit?: (input: unknown) => Promise<void>;
  }) =>
    props.visible
      ? require("react").createElement(require("react-native").View, {
          testID: "edit-account-modal",
          onPress: props.onClose,
          onLongPress: () =>
            props.onSubmit?.({ storeName: "new", saName: "s", notes: "n" }),
        })
      : null,
}));
jest.mock("./tracker-accounts-detail-purchaseFormModal.view", () => ({
  TrackerAccountsDetailPurchaseFormModalView: (props: {
    visible: boolean;
    onClose?: () => void;
    onSubmit?: (input: unknown) => Promise<void>;
    defaultValues?: { itemName?: string };
  }) =>
    props.visible
      ? require("react").createElement(require("react-native").View, {
          testID: props.defaultValues
            ? `purchase-form-modal-edit-${props.defaultValues.itemName}`
            : "purchase-form-modal-create",
          onPress: props.onClose,
          onLongPress: () =>
            props.onSubmit?.({
              itemName: "x",
              amount: 100,
              purchaseDate: "2024.01.01",
            }),
        })
      : null,
}));

import { TrackerAccountsDetailViews } from "./tracker-accounts-detail.views";

const purchase = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  type: "regular" as const,
  productName: `Product ${id}`,
  date: "2024.03.15",
  amount: 1000,
  ...overrides,
});

describe("TrackerAccountsDetailViews", () => {
  let showConfirmDialog: jest.Mock;
  beforeEach(() => {
    const ui =
      jest.requireMock<typeof import("@aramiworks/ui")>("@aramiworks/ui");
    showConfirmDialog = ui.useConfirmDialog().showConfirmDialog as jest.Mock;
    showConfirmDialog.mockClear();
  });

  it("renders default screen with back button, title, header, tank status, and purchase rows", () => {
    const { getByTestId } = render(
      <TrackerAccountsDetailViews
        screenState="default"
        purchases={[purchase("1"), purchase("2")]}
      />,
    );
    expect(getByTestId("accounts-detail-screen")).toBeTruthy();
    expect(getByTestId("accounts-detail-back")).toBeTruthy();
    expect(getByTestId("accounts-detail-sa-header")).toBeTruthy();
    expect(getByTestId("accounts-detail-tank-status-eligible")).toBeTruthy();
    expect(getByTestId("purchase-row-1")).toBeTruthy();
    expect(getByTestId("purchase-row-2")).toBeTruthy();
    expect(getByTestId("accounts-detail-add-purchase")).toBeTruthy();
  });

  it("uses the storybook default purchases when none are provided", () => {
    const { getByTestId } = render(<TrackerAccountsDetailViews />);
    expect(getByTestId("purchase-row-1")).toBeTruthy();
    expect(getByTestId("purchase-row-3")).toBeTruthy();
  });

  it("maps noPurchases tank state to notEligible", () => {
    const { getByTestId } = render(
      <TrackerAccountsDetailViews
        screenState="default"
        tankState="noPurchases"
      />,
    );
    expect(getByTestId("accounts-detail-tank-status-notEligible")).toBeTruthy();
  });

  it("renders loading skeletons", () => {
    const { getAllByTestId } = render(
      <TrackerAccountsDetailViews screenState="loading" />,
    );
    expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
  });

  it("renders error state and hides edit/delete actions", () => {
    const { getByTestId, queryByTestId } = render(
      <TrackerAccountsDetailViews
        screenState="error"
        onRetry={jest.fn()}
        onUpdateAccount={jest.fn()}
        onDeleteAccount={jest.fn()}
      />,
    );
    expect(getByTestId("error-state")).toBeTruthy();
    expect(queryByTestId("accounts-detail-edit")).toBeNull();
    expect(queryByTestId("accounts-detail-delete")).toBeNull();
  });

  it("shows edit action only when onUpdateAccount is wired", () => {
    const { queryByTestId, rerender } = render(
      <TrackerAccountsDetailViews screenState="default" />,
    );
    expect(queryByTestId("accounts-detail-edit")).toBeNull();
    rerender(
      <TrackerAccountsDetailViews
        screenState="default"
        onUpdateAccount={jest.fn()}
      />,
    );
    expect(queryByTestId("accounts-detail-edit")).toBeTruthy();
  });

  it("shows delete action only when onDeleteAccount is wired", () => {
    const { queryByTestId, rerender } = render(
      <TrackerAccountsDetailViews screenState="default" />,
    );
    expect(queryByTestId("accounts-detail-delete")).toBeNull();
    rerender(
      <TrackerAccountsDetailViews
        screenState="default"
        onDeleteAccount={jest.fn()}
      />,
    );
    expect(queryByTestId("accounts-detail-delete")).toBeTruthy();
  });

  it("invokes onBack when the back button is pressed", () => {
    const onBack = jest.fn();
    const { getByTestId } = render(
      <TrackerAccountsDetailViews screenState="default" onBack={onBack} />,
    );
    fireEvent.press(getByTestId("accounts-detail-back"));
    expect(onBack).toHaveBeenCalled();
  });

  it("opens delete-account confirm dialog when delete action pressed and fires onDeleteAccount on confirm", () => {
    const onDeleteAccount = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <TrackerAccountsDetailViews
        screenState="default"
        onDeleteAccount={onDeleteAccount}
      />,
    );
    fireEvent.press(getByTestId("accounts-detail-delete"));
    expect(showConfirmDialog).toHaveBeenCalledTimes(1);
    const options = (showConfirmDialog as jest.Mock).mock.calls[0][0];
    expect(options.confirmLabel).toBe("삭제");
    expect(options.dismissLabel).toBe("취소");
    options.onConfirm();
    expect(onDeleteAccount).toHaveBeenCalled();
  });

  it("opens purchase delete confirm dialog on purchase row long-press and fires onDeletePurchase on confirm", () => {
    const onDeletePurchase = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <TrackerAccountsDetailViews
        screenState="default"
        purchases={[purchase("del")]}
        onDeletePurchase={onDeletePurchase}
      />,
    );
    fireEvent(getByTestId("purchase-row-del"), "longPress");
    expect(showConfirmDialog).toHaveBeenCalledTimes(1);
    const options = (showConfirmDialog as jest.Mock).mock.calls[0][0];
    expect(options.confirmLabel).toBe("삭제");
    expect(options.dismissLabel).toBe("취소");
    options.onConfirm();
    expect(onDeletePurchase).toHaveBeenCalledWith("del");
  });

  it("does not open confirm dialog when onDeletePurchase is absent", () => {
    const { getByTestId } = render(
      <TrackerAccountsDetailViews
        screenState="default"
        purchases={[purchase("plain")]}
      />,
    );
    fireEvent(getByTestId("purchase-row-plain"), "longPress");
    expect(showConfirmDialog).not.toHaveBeenCalled();
  });

  it("opens and closes the edit-account modal", () => {
    const { getByTestId, queryByTestId } = render(
      <TrackerAccountsDetailViews
        screenState="default"
        onUpdateAccount={jest.fn()}
      />,
    );
    expect(queryByTestId("edit-account-modal")).toBeNull();
    fireEvent.press(getByTestId("accounts-detail-edit"));
    expect(getByTestId("edit-account-modal")).toBeTruthy();
    fireEvent.press(getByTestId("edit-account-modal"));
    expect(queryByTestId("edit-account-modal")).toBeNull();
  });

  it("opens purchase form modal in create mode via add-purchase button", () => {
    const { getByTestId, queryByTestId } = render(
      <TrackerAccountsDetailViews
        screenState="default"
        onCreatePurchase={jest.fn()}
      />,
    );
    expect(queryByTestId("purchase-form-modal-create")).toBeNull();
    fireEvent.press(getByTestId("accounts-detail-add-purchase"));
    expect(getByTestId("purchase-form-modal-create")).toBeTruthy();
  });

  it("opens purchase form modal in edit mode via purchase row press", () => {
    const { getByTestId } = render(
      <TrackerAccountsDetailViews
        screenState="default"
        purchases={[purchase("edit-me")]}
        onUpdatePurchase={jest.fn()}
      />,
    );
    fireEvent.press(getByTestId("purchase-row-edit-me"));
    expect(
      getByTestId("purchase-form-modal-edit-Product edit-me"),
    ).toBeTruthy();
  });

  it("submits purchase edits via onUpdatePurchase when editing, and resets modal on close", async () => {
    const onUpdatePurchase = jest.fn().mockResolvedValue(undefined);
    const { getByTestId, queryByTestId } = render(
      <TrackerAccountsDetailViews
        screenState="default"
        purchases={[purchase("u1")]}
        onUpdatePurchase={onUpdatePurchase}
      />,
    );
    fireEvent.press(getByTestId("purchase-row-u1"));
    // Submit (mock forwards longPress -> onSubmit).
    fireEvent(getByTestId("purchase-form-modal-edit-Product u1"), "longPress");
    await Promise.resolve();
    expect(onUpdatePurchase).toHaveBeenCalledWith("u1", expect.any(Object));
    // Close resets editing state; next open should be create mode.
    fireEvent.press(getByTestId("purchase-form-modal-edit-Product u1"));
    expect(queryByTestId("purchase-form-modal-edit-Product u1")).toBeNull();
  });

  it("purchase submit is a no-op when neither editing nor onCreatePurchase is provided", async () => {
    const onUpdatePurchase = jest.fn();
    const { getByTestId } = render(
      <TrackerAccountsDetailViews
        screenState="default"
        onUpdatePurchase={onUpdatePurchase}
      />,
    );
    fireEvent.press(getByTestId("accounts-detail-add-purchase"));
    fireEvent(getByTestId("purchase-form-modal-create"), "longPress");
    await Promise.resolve();
    expect(onUpdatePurchase).not.toHaveBeenCalled();
  });

  it("submits new purchases via onCreatePurchase when no row is being edited", async () => {
    const onCreatePurchase = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <TrackerAccountsDetailViews
        screenState="default"
        onCreatePurchase={onCreatePurchase}
      />,
    );
    fireEvent.press(getByTestId("accounts-detail-add-purchase"));
    fireEvent(getByTestId("purchase-form-modal-create"), "longPress");
    await Promise.resolve();
    expect(onCreatePurchase).toHaveBeenCalledWith(expect.any(Object));
  });
});

// Silence unused React warning from the import used for JSX.
void React;
