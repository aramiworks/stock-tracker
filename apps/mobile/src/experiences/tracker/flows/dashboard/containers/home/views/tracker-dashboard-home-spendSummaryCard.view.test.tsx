import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TrackerDashboardHomeSpendSummaryCardView } from "./tracker-dashboard-home-spendSummaryCard.view";

describe("TrackerDashboardHomeSpendSummaryCardView", () => {
  it("renders populated state with formatted amounts", () => {
    render(
      <TrackerDashboardHomeSpendSummaryCardView
        state="populated"
        totalSpend={12450000}
        goalAmount={30000000}
      />,
    );
    expect(screen.getByTestId("spend-summary-card")).toBeTruthy();
    expect(screen.getByText("₩12,450,000")).toBeTruthy();
    expect(screen.getByText("dashboard.spendSummary.label")).toBeTruthy();
    expect(screen.getByText("dashboard.spendSummary.goal")).toBeTruthy();
    expect(screen.getByText("41.5%")).toBeTruthy();
  });

  it("renders zero state with 0% progress", () => {
    render(
      <TrackerDashboardHomeSpendSummaryCardView
        state="zero"
        totalSpend={0}
        goalAmount={30000000}
      />,
    );
    expect(screen.getByTestId("spend-summary-card")).toBeTruthy();
    expect(screen.getByText("₩0")).toBeTruthy();
    expect(screen.getByText("0%")).toBeTruthy();
  });

  it("renders loading state with skeleton placeholders", () => {
    render(<TrackerDashboardHomeSpendSummaryCardView state="loading" />);
    expect(screen.queryByTestId("spend-summary-card")).toBeNull();
    expect(screen.queryByText("₩12,450,000")).toBeNull();
  });

  it("renders with default props", () => {
    render(<TrackerDashboardHomeSpendSummaryCardView />);
    expect(screen.getByTestId("spend-summary-card")).toBeTruthy();
    expect(screen.getByText("₩12,450,000")).toBeTruthy();
  });

  it("handles zero goalAmount without division error", () => {
    render(
      <TrackerDashboardHomeSpendSummaryCardView
        state="populated"
        totalSpend={5000000}
        goalAmount={0}
      />,
    );
    expect(screen.getByText("0%")).toBeTruthy();
  });
});
