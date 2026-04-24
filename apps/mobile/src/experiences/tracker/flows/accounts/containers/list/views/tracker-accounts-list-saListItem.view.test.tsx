import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { TrackerAccountsListSaListItemView } from "./tracker-accounts-list-saListItem.view";

describe("TrackerAccountsListSaListItemView", () => {
  it("renders with default props", () => {
    render(<TrackerAccountsListSaListItemView id="sa1" />);
    expect(screen.getByTestId("sa-list-item-sa1")).toBeTruthy();
    expect(screen.getByText("김서연 SA")).toBeTruthy();
    expect(screen.getByText("김")).toBeTruthy();
    expect(screen.getByText("청담 부티크")).toBeTruthy();
  });

  it("renders custom props", () => {
    render(
      <TrackerAccountsListSaListItemView
        id="sa2"
        name="박지현 SA"
        initial="박"
        boutique="강남 부티크"
        totalSpend={3000000}
        state="notEligible"
      />,
    );
    expect(screen.getByText("박지현 SA")).toBeTruthy();
    expect(screen.getByText("박")).toBeTruthy();
    expect(screen.getByText("강남 부티크")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<TrackerAccountsListSaListItemView id="sa1" onPress={onPress} />);
    fireEvent.press(screen.getByTestId("sa-list-item-sa1"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("calls onLongPress when long-pressed", () => {
    const onLongPress = jest.fn();
    render(
      <TrackerAccountsListSaListItemView id="sa1" onLongPress={onLongPress} />,
    );
    fireEvent(screen.getByTestId("sa-list-item-sa1"), "longPress");
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it("renders eligible status text", () => {
    render(<TrackerAccountsListSaListItemView id="sa1" state="eligible" />);
    expect(
      screen.getByText("accounts.list.saListItem.statusEligible"),
    ).toBeTruthy();
  });

  it("renders noPurchases status text", () => {
    render(<TrackerAccountsListSaListItemView id="sa1" state="noPurchases" />);
    expect(
      screen.getByText("accounts.list.saListItem.statusNoPurchases"),
    ).toBeTruthy();
  });
});
