import React from "react";
import { render, screen } from "@testing-library/react-native";
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
});
