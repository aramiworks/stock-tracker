import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TrackerAccountsDetailPurchaseFormModalView } from "./tracker-accounts-detail-purchaseFormModal.view";

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
  purchaseCreateInputSchema: {},
}));

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockResolvedValue(undefined),
};

describe("TrackerAccountsDetailPurchaseFormModalView", () => {
  it("renders form fields when visible", () => {
    render(<TrackerAccountsDetailPurchaseFormModalView {...defaultProps} />);
    expect(screen.getByTestId("purchase-form")).toBeTruthy();
    expect(screen.getByTestId("purchase-form-itemName")).toBeTruthy();
    expect(screen.getByTestId("purchase-form-amount")).toBeTruthy();
    expect(screen.getByTestId("purchase-form-purchaseDate")).toBeTruthy();
    expect(screen.getByTestId("purchase-form-itemCategory")).toBeTruthy();
    expect(screen.getByTestId("purchase-form-storeLocation")).toBeTruthy();
    expect(screen.getByTestId("purchase-form-notes")).toBeTruthy();
  });

  it("does not render when not visible", () => {
    render(
      <TrackerAccountsDetailPurchaseFormModalView
        {...defaultProps}
        visible={false}
      />,
    );
    expect(screen.queryByTestId("purchase-form-itemName")).toBeNull();
  });

  it("shows add title when no defaultValues", () => {
    render(<TrackerAccountsDetailPurchaseFormModalView {...defaultProps} />);
    expect(screen.getByText("purchases.form.add.title")).toBeTruthy();
  });

  it("shows edit title when defaultValues provided", () => {
    render(
      <TrackerAccountsDetailPurchaseFormModalView
        {...defaultProps}
        defaultValues={{ itemName: "반지" }}
      />,
    );
    expect(screen.getByText("purchases.form.edit.title")).toBeTruthy();
  });
});
