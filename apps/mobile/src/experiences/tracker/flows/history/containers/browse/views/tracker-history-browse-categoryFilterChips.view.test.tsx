import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TrackerHistoryBrowseCategoryFilterChipsView } from "./tracker-history-browse-categoryFilterChips.view";

describe("TrackerHistoryBrowseCategoryFilterChipsView", () => {
  it("renders the all chip and all 9 category chips", () => {
    const { getByTestId } = render(
      <TrackerHistoryBrowseCategoryFilterChipsView />,
    );
    expect(getByTestId("category-filter-all")).toBeTruthy();
    expect(getByTestId("category-filter-브레이슬릿")).toBeTruthy();
    expect(getByTestId("category-filter-목걸이")).toBeTruthy();
    expect(getByTestId("category-filter-시계")).toBeTruthy();
    expect(getByTestId("category-filter-반지")).toBeTruthy();
    expect(getByTestId("category-filter-귀걸이")).toBeTruthy();
    expect(getByTestId("category-filter-가방")).toBeTruthy();
    expect(getByTestId("category-filter-지갑")).toBeTruthy();
    expect(getByTestId("category-filter-벨트")).toBeTruthy();
    expect(getByTestId("category-filter-기타")).toBeTruthy();
  });

  it("calls onSelect with the category when a chip is pressed", () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <TrackerHistoryBrowseCategoryFilterChipsView onSelect={onSelect} />,
    );
    fireEvent.press(getByTestId("category-filter-시계"));
    expect(onSelect).toHaveBeenCalledWith("시계");
  });

  it("calls onSelect with null when the all chip is pressed", () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <TrackerHistoryBrowseCategoryFilterChipsView
        selected="반지"
        onSelect={onSelect}
      />,
    );
    fireEvent.press(getByTestId("category-filter-all"));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});

void React;
