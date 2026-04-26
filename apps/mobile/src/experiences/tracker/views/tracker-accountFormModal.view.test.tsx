import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";

jest.mock("@/shared/components/text-input-field", () => ({
  TextInputField: (props: Record<string, unknown>) =>
    require("react").createElement(require("react-native").View, {
      testID: props.testID,
    }),
}));

jest.mock("@stock-tracker/validation", () => ({
  accountCreateInputSchema: {
    parse: (data: unknown) => data,
    safeParse: (data: unknown) => ({ success: true, data }),
  },
}));

jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({ values: {}, errors: {} }),
}));

import { TrackerAccountFormModalView } from "./tracker-accountFormModal.view";

describe("TrackerAccountFormModalView", () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onSubmit: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal when visible is true", () => {
    const { getByTestId } = render(
      <TrackerAccountFormModalView {...defaultProps} />,
    );
    expect(getByTestId("account-form")).toBeTruthy();
  });

  it("does not render when visible is false", () => {
    const { queryByTestId } = render(
      <TrackerAccountFormModalView {...defaultProps} visible={false} />,
    );
    expect(queryByTestId("account-form")).toBeNull();
  });

  it("renders three TextInputField components", () => {
    const { getByTestId } = render(
      <TrackerAccountFormModalView {...defaultProps} />,
    );
    expect(getByTestId("account-form-storeName")).toBeTruthy();
    expect(getByTestId("account-form-saName")).toBeTruthy();
    expect(getByTestId("account-form-notes")).toBeTruthy();
  });

  it("cancel button calls onClose", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <TrackerAccountFormModalView {...defaultProps} onClose={onClose} />,
    );
    fireEvent.press(getByTestId("account-form-cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("action button triggers form submission", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    const { getByTestId } = render(
      <TrackerAccountFormModalView
        {...defaultProps}
        onSubmit={onSubmit}
        onClose={onClose}
      />,
    );
    await act(async () => {
      fireEvent.press(getByTestId("account-form-action"));
    });
    expect(onSubmit).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});

void React;
