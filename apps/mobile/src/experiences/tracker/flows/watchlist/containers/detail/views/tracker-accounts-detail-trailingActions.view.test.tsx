import { render, fireEvent } from "@testing-library/react-native";
import { TrackerAccountsDetailTrailingActionsView } from "./tracker-accounts-detail-trailingActions.view";

describe("TrackerAccountsDetailTrailingActionsView", () => {
  it("returns null when neither handler is provided", () => {
    const { queryByTestId } = render(
      <TrackerAccountsDetailTrailingActionsView />,
    );
    expect(queryByTestId("accounts-detail-edit")).toBeNull();
    expect(queryByTestId("accounts-detail-delete")).toBeNull();
  });

  it("renders edit button and calls onEdit", () => {
    const onEdit = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <TrackerAccountsDetailTrailingActionsView onEdit={onEdit} />,
    );
    fireEvent.press(getByTestId("accounts-detail-edit"));
    expect(onEdit).toHaveBeenCalled();
    expect(queryByTestId("accounts-detail-delete")).toBeNull();
  });

  it("renders delete button and calls onDelete", () => {
    const onDelete = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <TrackerAccountsDetailTrailingActionsView onDelete={onDelete} />,
    );
    fireEvent.press(getByTestId("accounts-detail-delete"));
    expect(onDelete).toHaveBeenCalled();
    expect(queryByTestId("accounts-detail-edit")).toBeNull();
  });

  it("renders both edit and delete when both handlers are provided", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <TrackerAccountsDetailTrailingActionsView
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
    expect(getByTestId("accounts-detail-edit")).toBeTruthy();
    expect(getByTestId("accounts-detail-delete")).toBeTruthy();
  });
});
