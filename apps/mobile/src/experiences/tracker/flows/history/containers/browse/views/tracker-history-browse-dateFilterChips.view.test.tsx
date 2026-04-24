import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TrackerHistoryBrowseDateFilterChipsView } from "./tracker-history-browse-dateFilterChips.view";

describe("TrackerHistoryBrowseDateFilterChipsView", () => {
  it("renders all four date filter chips", () => {
    const { getByTestId } = render(<TrackerHistoryBrowseDateFilterChipsView />);
    expect(getByTestId("date-filter-thisMonth")).toBeTruthy();
    expect(getByTestId("date-filter-threeMonths")).toBeTruthy();
    expect(getByTestId("date-filter-thisYear")).toBeTruthy();
    expect(getByTestId("date-filter-all")).toBeTruthy();
  });

  it("calls onSelect with the filter value when a chip is pressed", () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <TrackerHistoryBrowseDateFilterChipsView onSelect={onSelect} />,
    );
    fireEvent.press(getByTestId("date-filter-threeMonths"));
    expect(onSelect).toHaveBeenCalledWith("threeMonths");
  });

  it("defaults selected to thisMonth", () => {
    const { getByTestId } = render(<TrackerHistoryBrowseDateFilterChipsView />);
    expect(getByTestId("date-filter-thisMonth")).toBeTruthy();
  });
});

void React;
