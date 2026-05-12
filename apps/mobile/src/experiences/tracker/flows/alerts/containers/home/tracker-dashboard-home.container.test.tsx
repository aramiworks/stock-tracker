jest.mock("./models", () => ({
  TrackerDashboardHomeModels: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock("./controllers", () => ({
  TrackerDashboardHomeControllers: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
  useTrackerDashboardHomeControllers: () => ({ screenState: "default" }),
}));

jest.mock("./views", () => ({
  TrackerDashboardHomeViews: (props: Record<string, unknown>) =>
    `DashboardHomeViews:${props.screenState ?? "default"}`,
}));

jest.mock("@/shared/components/query-error-boundary", () => ({
  QueryErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

import React from "react";
import { render } from "@testing-library/react-native";
import { TrackerDashboardHomeContainer } from "./tracker-dashboard-home.container";

describe("TrackerDashboardHomeContainer", () => {
  it("renders ConnectedViews through Models > Controllers composition", () => {
    const { toJSON } = render(<TrackerDashboardHomeContainer />);
    expect(toJSON()).toBe("DashboardHomeViews:default");
  });
});
