import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { TrackerDashboardHomeSaCardView } from "./tracker-dashboard-home-saCard.view";

describe("TrackerDashboardHomeSaCardView", () => {
  it("renders with default props", () => {
    render(<TrackerDashboardHomeSaCardView />);
    expect(screen.getByTestId("sa-card")).toBeTruthy();
    expect(screen.getByText("김서연 SA")).toBeTruthy();
    expect(screen.getByText("김")).toBeTruthy();
  });

  it("renders with custom name, initial, and boutique", () => {
    render(
      <TrackerDashboardHomeSaCardView
        name="박지훈 SA"
        initial="박"
        boutique="강남 부티크"
      />,
    );
    expect(screen.getByText("박지훈 SA")).toBeTruthy();
    expect(screen.getByText("박")).toBeTruthy();
  });

  it("renders with id in testID", () => {
    render(<TrackerDashboardHomeSaCardView id="123" />);
    expect(screen.getByTestId("sa-card-123")).toBeTruthy();
  });

  it("calls onPress when card is pressed", () => {
    const onPress = jest.fn();
    render(<TrackerDashboardHomeSaCardView onPress={onPress} />);
    fireEvent.press(screen.getByTestId("sa-card"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders eligible status text", () => {
    render(
      <TrackerDashboardHomeSaCardView
        state="eligible"
        boutique="청담 부티크"
      />,
    );
    expect(screen.getByText("dashboard.saCard.statusEligible")).toBeTruthy();
  });

  it("renders notEligible status text", () => {
    render(<TrackerDashboardHomeSaCardView state="notEligible" />);
    expect(screen.getByText("dashboard.saCard.statusNotEligible")).toBeTruthy();
  });

  it("renders noPurchases status text", () => {
    render(<TrackerDashboardHomeSaCardView state="noPurchases" />);
    expect(screen.getByText("dashboard.saCard.statusNoPurchases")).toBeTruthy();
  });

  it("renders spend text for eligible state", () => {
    render(
      <TrackerDashboardHomeSaCardView state="eligible" totalSpend={5000000} />,
    );
    expect(screen.getByText("dashboard.saCard.spend")).toBeTruthy();
  });

  it("renders noPurchases spend text for noPurchases state", () => {
    render(<TrackerDashboardHomeSaCardView state="noPurchases" />);
    expect(screen.getByText("dashboard.saCard.noPurchases")).toBeTruthy();
  });
});
