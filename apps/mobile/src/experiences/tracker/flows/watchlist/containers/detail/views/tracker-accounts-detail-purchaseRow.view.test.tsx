import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { TrackerAccountsDetailPurchaseRowView } from "./tracker-accounts-detail-purchaseRow.view";

jest.mock("@/experiences/tracker/views", () => ({
  TrackerPurchaseRowView: (props: Record<string, unknown>) =>
    require("react").createElement(require("react-native").View, {
      testID: props.testID,
    }),
}));

describe("TrackerAccountsDetailPurchaseRowView", () => {
  it("renders purchase row with testID", () => {
    render(<TrackerAccountsDetailPurchaseRowView id="p1" />);
    expect(screen.getByTestId("purchase-row-p1")).toBeTruthy();
  });

  it("renders edit button and fires handler", () => {
    const onEdit = jest.fn();
    render(<TrackerAccountsDetailPurchaseRowView id="p1" onEdit={onEdit} />);
    fireEvent.press(screen.getByTestId("purchase-edit-p1"));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("renders delete button and fires handler", () => {
    const onDelete = jest.fn();
    render(
      <TrackerAccountsDetailPurchaseRowView id="p1" onDelete={onDelete} />,
    );
    fireEvent.press(screen.getByTestId("purchase-delete-p1"));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("hides action buttons when no handlers provided", () => {
    render(<TrackerAccountsDetailPurchaseRowView id="p1" />);
    expect(screen.queryByTestId("purchase-edit-p1")).toBeNull();
    expect(screen.queryByTestId("purchase-delete-p1")).toBeNull();
  });
});
