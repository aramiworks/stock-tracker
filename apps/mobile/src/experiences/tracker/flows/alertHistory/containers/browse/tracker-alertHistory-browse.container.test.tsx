jest.mock("./models/tracker-alertHistory-browse.models", () => ({
  TrackerAlertHistoryBrowseModels: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
}));

jest.mock("./controllers/tracker-alertHistory-browse.controllers", () => ({
  TrackerAlertHistoryBrowseControllers: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
  useTrackerAlertHistoryBrowseControllers: () => ({
    screenState: "default",
    events: [],
    isRefreshing: false,
    onRefresh: jest.fn(),
  }),
}));

jest.mock("./views/tracker-alertHistory-browse.views", () => ({
  TrackerAlertHistoryBrowseViews: (props: Record<string, unknown>) =>
    `AlertHistoryBrowseViews:${props.screenState ?? "default"}`,
}));

jest.mock("@/shared/components/container-error-boundary", () => ({
  ContainerErrorBoundary: ({ children }: { children: React.ReactNode }) =>
    children,
}));

import React from "react";
import { render } from "@testing-library/react-native";
import { TrackerAlertHistoryBrowseContainer } from "./tracker-alertHistory-browse.container";

describe("TrackerAlertHistoryBrowseContainer", () => {
  it("renders ConnectedViews through Models > Controllers composition", () => {
    const { toJSON } = render(<TrackerAlertHistoryBrowseContainer />);
    expect(toJSON()).toBe("AlertHistoryBrowseViews:default");
  });
});

// Silence unused-React warning.
void React;
