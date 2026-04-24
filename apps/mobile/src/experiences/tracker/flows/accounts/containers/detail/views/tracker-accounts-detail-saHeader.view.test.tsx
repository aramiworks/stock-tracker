import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TrackerAccountsDetailSaHeaderView } from "./tracker-accounts-detail-saHeader.view";

describe("TrackerAccountsDetailSaHeaderView", () => {
  it("renders with default props", () => {
    render(<TrackerAccountsDetailSaHeaderView testID="sa-header" />);
    expect(screen.getByTestId("sa-header")).toBeTruthy();
    expect(screen.getByText("김서연 SA")).toBeTruthy();
    expect(screen.getByText("김")).toBeTruthy();
  });

  it("renders custom name and initial", () => {
    render(<TrackerAccountsDetailSaHeaderView name="박지현 SA" initial="박" />);
    expect(screen.getByText("박지현 SA")).toBeTruthy();
    expect(screen.getByText("박")).toBeTruthy();
  });

  it("renders boutique and totalSpend in subtitle", () => {
    render(
      <TrackerAccountsDetailSaHeaderView
        boutique="강남 부티크"
        totalSpend={5000000}
      />,
    );
    expect(
      screen.getByText(`강남 부티크 · ₩${(5000000).toLocaleString()}`),
    ).toBeTruthy();
  });
});
