import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import { TrackerAccountsDetailEditAccountModalView } from "./tracker-accounts-detail-editAccountModal.view";

jest.mock("@/shared/components/text-input-field", () => ({
  TextInputField: (props: Record<string, unknown>) =>
    require("react").createElement(require("react-native").View, {
      testID: props.testID,
    }),
}));

jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({ values: {}, errors: {} }),
}));

jest.mock("@stock-tracker/validation", () => ({
  accountUpdateInputSchema: {},
}));

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockResolvedValue(undefined),
  currentValues: {
    id: "acc-1",
    storeName: "청담 부티크",
    saName: "김서연",
    notes: "메모",
  },
};

describe("TrackerAccountsDetailEditAccountModalView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form fields when visible", () => {
    render(<TrackerAccountsDetailEditAccountModalView {...defaultProps} />);
    expect(screen.getByTestId("edit-account-form")).toBeTruthy();
    expect(screen.getByTestId("edit-account-form-storeName")).toBeTruthy();
    expect(screen.getByTestId("edit-account-form-saName")).toBeTruthy();
    expect(screen.getByTestId("edit-account-form-notes")).toBeTruthy();
  });

  it("does not render when not visible", () => {
    render(
      <TrackerAccountsDetailEditAccountModalView
        {...defaultProps}
        visible={false}
      />,
    );
    expect(screen.queryByTestId("edit-account-form-storeName")).toBeNull();
  });

  it("cancel button calls onClose and resets form", () => {
    const onClose = jest.fn();
    render(
      <TrackerAccountsDetailEditAccountModalView
        {...defaultProps}
        onClose={onClose}
      />,
    );
    fireEvent.press(screen.getByTestId("edit-account-form-cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("action button triggers form submission", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    render(
      <TrackerAccountsDetailEditAccountModalView
        {...defaultProps}
        onSubmit={onSubmit}
        onClose={onClose}
      />,
    );
    await act(async () => {
      fireEvent.press(screen.getByTestId("edit-account-form-action"));
    });
    expect(onSubmit).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});

void React;
