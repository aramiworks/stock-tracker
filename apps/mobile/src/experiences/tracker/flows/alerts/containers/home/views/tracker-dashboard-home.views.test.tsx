import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

// Mock child views — each passed through as a simple testID stub.
// Note: jest.mock factories run before imports, so all RN imports must be
// required inline (see INF-1058 — factory may not reference out-of-scope vars).
jest.mock("./tracker-dashboard-home-eligibilityBadge.view", () => ({
  TrackerDashboardHomeEligibilityBadgeView: (props: { state: string }) =>
    require("react").createElement(require("react-native").View, {
      testID: `eligibility-badge-${props.state}`,
    }),
}));
jest.mock("./tracker-dashboard-home-spendSummaryCard.view", () => ({
  TrackerDashboardHomeSpendSummaryCardView: () =>
    require("react").createElement(require("react-native").View, {
      testID: "spend-summary-card",
    }),
}));
jest.mock("./tracker-dashboard-home-saCard.view", () => ({
  TrackerDashboardHomeSaCardView: (props: {
    id: string;
    onPress?: () => void;
  }) =>
    require("react").createElement(require("react-native").View, {
      testID: `sa-card-${props.id}`,
      onPress: props.onPress,
    }),
}));
jest.mock("./tracker-dashboard-home-refreshFab.view", () => ({
  TrackerDashboardHomeRefreshFabView: (props: { onPress?: () => void }) =>
    require("react").createElement(require("react-native").View, {
      testID: "refresh-fab",
      onPress: props.onPress,
    }),
}));
jest.mock("./tracker-dashboard-home-emptyState.view", () => ({
  TrackerDashboardHomeEmptyStateView: (props: { onCtaPress?: () => void }) =>
    require("react").createElement(require("react-native").View, {
      testID: "empty-state",
      onPress: props.onCtaPress,
    }),
}));
jest.mock("./tracker-dashboard-home-errorState.view", () => ({
  TrackerDashboardHomeErrorStateView: (props: { onRetry?: () => void }) =>
    require("react").createElement(require("react-native").View, {
      testID: "error-state",
      onPress: props.onRetry,
    }),
}));
jest.mock("@/experiences/tracker/views", () => ({
  TrackerSkeletonCardView: () =>
    require("react").createElement(require("react-native").View, {
      testID: "skeleton-card",
    }),
}));
jest.mock("@/experiences/tracker/views/tracker-accountFormModal.view", () => ({
  TrackerAccountFormModalView: (props: {
    visible: boolean;
    onClose?: () => void;
  }) =>
    props.visible
      ? require("react").createElement(require("react-native").View, {
          testID: "account-form-modal",
          onPress: props.onClose,
        })
      : null,
}));

import { TrackerDashboardHomeViews } from "./tracker-dashboard-home.views";

describe("TrackerDashboardHomeViews", () => {
  it("renders default screen with title, summary, and sa cards", () => {
    const { getByTestId } = render(
      <TrackerDashboardHomeViews
        screenState="default"
        eligibilityStatus="eligible"
        totalSpend={10000}
        goalAmount={30000}
        saAccounts={[
          {
            id: "1",
            state: "eligible",
            name: "A",
            initial: "A",
            boutique: "B1",
            totalSpend: 100,
          },
        ]}
      />,
    );
    expect(getByTestId("dashboard-home-screen")).toBeTruthy();
    expect(getByTestId("dashboard-home-title")).toBeTruthy();
    expect(getByTestId("eligibility-badge-eligible")).toBeTruthy();
    expect(getByTestId("spend-summary-card")).toBeTruthy();
    expect(getByTestId("sa-card-1")).toBeTruthy();
    expect(getByTestId("refresh-fab")).toBeTruthy();
    expect(getByTestId("add-account-fab")).toBeTruthy();
  });

  it("renders zero spend state when totalSpend is 0", () => {
    const { getByTestId } = render(
      <TrackerDashboardHomeViews
        screenState="default"
        totalSpend={0}
        saAccounts={[]}
      />,
    );
    expect(getByTestId("spend-summary-card")).toBeTruthy();
  });

  it("renders empty state with CTA and add FAB (no refresh FAB)", () => {
    const { getByTestId, queryByTestId } = render(
      <TrackerDashboardHomeViews screenState="empty" />,
    );
    expect(getByTestId("eligibility-badge-notEligible")).toBeTruthy();
    expect(getByTestId("empty-state")).toBeTruthy();
    expect(getByTestId("add-account-fab")).toBeTruthy();
    expect(queryByTestId("refresh-fab")).toBeNull();
  });

  it("renders loading skeletons and hides FABs", () => {
    const { getAllByTestId, queryByTestId } = render(
      <TrackerDashboardHomeViews screenState="loading" />,
    );
    expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
    expect(queryByTestId("add-account-fab")).toBeNull();
    expect(queryByTestId("refresh-fab")).toBeNull();
  });

  it("renders error state and hides FABs", () => {
    const { getByTestId, queryByTestId } = render(
      <TrackerDashboardHomeViews screenState="error" onRetry={jest.fn()} />,
    );
    expect(getByTestId("error-state")).toBeTruthy();
    expect(queryByTestId("add-account-fab")).toBeNull();
    expect(queryByTestId("refresh-fab")).toBeNull();
  });

  it("uses default saAccounts=[] and renders default state", () => {
    const { getByTestId } = render(
      <TrackerDashboardHomeViews screenState="default" />,
    );
    expect(getByTestId("dashboard-home-screen")).toBeTruthy();
    expect(getByTestId("spend-summary-card")).toBeTruthy();
  });

  it("falls back to default state when screenState is undefined", () => {
    const { getByTestId } = render(<TrackerDashboardHomeViews />);
    expect(getByTestId("dashboard-home-screen")).toBeTruthy();
    expect(getByTestId("spend-summary-card")).toBeTruthy();
  });

  it("renders multiple sa cards with alternating spacing", () => {
    const { getByTestId } = render(
      <TrackerDashboardHomeViews
        screenState="default"
        saAccounts={[
          {
            id: "1",
            state: "eligible",
            name: "A",
            initial: "A",
            boutique: "B1",
            totalSpend: 1,
          },
          {
            id: "2",
            state: "eligible",
            name: "B",
            initial: "B",
            boutique: "B2",
            totalSpend: 2,
          },
        ]}
      />,
    );
    expect(getByTestId("sa-card-1")).toBeTruthy();
    expect(getByTestId("sa-card-2")).toBeTruthy();
  });

  it("invokes onSaPress with the tapped account id", () => {
    const onSaPress = jest.fn();
    const { getByTestId } = render(
      <TrackerDashboardHomeViews
        screenState="default"
        saAccounts={[
          {
            id: "abc",
            state: "eligible",
            name: "A",
            initial: "A",
            boutique: "B1",
            totalSpend: 1,
          },
        ]}
        onSaPress={onSaPress}
      />,
    );
    fireEvent.press(getByTestId("sa-card-abc"));
    expect(onSaPress).toHaveBeenCalledWith("abc");
  });

  it("does not throw when onSaPress is undefined (optional chaining)", () => {
    const { getByTestId } = render(
      <TrackerDashboardHomeViews
        screenState="default"
        saAccounts={[
          {
            id: "x",
            state: "eligible",
            name: "A",
            initial: "A",
            boutique: "B1",
            totalSpend: 1,
          },
        ]}
      />,
    );
    expect(() => fireEvent.press(getByTestId("sa-card-x"))).not.toThrow();
  });

  it("opens and closes the account form modal via add FAB", () => {
    const { getByTestId, queryByTestId } = render(
      <TrackerDashboardHomeViews
        screenState="default"
        saAccounts={[]}
        onCreateAccount={jest.fn()}
      />,
    );
    expect(queryByTestId("account-form-modal")).toBeNull();
    fireEvent.press(getByTestId("add-account-fab"));
    expect(getByTestId("account-form-modal")).toBeTruthy();
    fireEvent.press(getByTestId("account-form-modal"));
    expect(queryByTestId("account-form-modal")).toBeNull();
  });

  it("opens the account form modal via empty-state CTA", () => {
    const { getByTestId, queryByTestId } = render(
      <TrackerDashboardHomeViews
        screenState="empty"
        onCreateAccount={jest.fn()}
      />,
    );
    expect(queryByTestId("account-form-modal")).toBeNull();
    fireEvent.press(getByTestId("empty-state"));
    expect(getByTestId("account-form-modal")).toBeTruthy();
  });
});

// Silence unused React warning from the import used for JSX.
void React;
