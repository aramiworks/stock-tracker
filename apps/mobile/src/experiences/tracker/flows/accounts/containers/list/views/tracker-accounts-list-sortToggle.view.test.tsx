import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { TrackerAccountsListSortToggleView } from "./tracker-accounts-list-sortToggle.view";

describe("TrackerAccountsListSortToggleView", () => {
  it("renders both sort chips", () => {
    const onToggle = jest.fn();
    render(
      <TrackerAccountsListSortToggleView
        sortBy="store_name"
        onToggle={onToggle}
      />,
    );
    expect(screen.getByTestId("sort-toggle-name")).toBeTruthy();
    expect(screen.getByTestId("sort-toggle-recent")).toBeTruthy();
    expect(screen.getByText("이름순")).toBeTruthy();
    expect(screen.getByText("최신순")).toBeTruthy();
  });

  it("calls onToggle when pressing inactive chip (recent)", () => {
    const onToggle = jest.fn();
    render(
      <TrackerAccountsListSortToggleView
        sortBy="store_name"
        onToggle={onToggle}
      />,
    );
    fireEvent.press(screen.getByTestId("sort-toggle-recent"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("calls onToggle when pressing inactive chip (name)", () => {
    const onToggle = jest.fn();
    render(
      <TrackerAccountsListSortToggleView
        sortBy="created_at"
        onToggle={onToggle}
      />,
    );
    fireEvent.press(screen.getByTestId("sort-toggle-name"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("does not call onToggle when pressing active chip", () => {
    const onToggle = jest.fn();
    render(
      <TrackerAccountsListSortToggleView
        sortBy="store_name"
        onToggle={onToggle}
      />,
    );
    fireEvent.press(screen.getByTestId("sort-toggle-name"));
    expect(onToggle).not.toHaveBeenCalled();
  });
});
