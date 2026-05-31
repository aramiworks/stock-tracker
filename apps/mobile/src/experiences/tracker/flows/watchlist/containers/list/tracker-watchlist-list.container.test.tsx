jest.mock("./models/tracker-watchlist-list.models", () => ({
  TrackerWatchlistListModels: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock("./controllers/tracker-watchlist-list.controllers", () => ({
  TrackerWatchlistListControllers: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
  useTrackerWatchlistListControllers: () => ({
    screenState: "default",
    groups: [],
    isRefreshing: false,
    onRefresh: jest.fn(),
    onAddProductsPress: jest.fn(),
    onEntryPress: jest.fn(),
  }),
}));

jest.mock("./views/tracker-watchlist-list.views", () => ({
  TrackerWatchlistListViews: (props: Record<string, unknown>) =>
    `WatchlistListViews:${props.screenState ?? "default"}`,
}));

jest.mock("@/shared/components/container-error-boundary", () => ({
  ContainerErrorBoundary: ({ children }: { children: React.ReactNode }) =>
    children,
}));

import React from "react";
import { render } from "@testing-library/react-native";
import { TrackerWatchlistListContainer } from "./tracker-watchlist-list.container";

describe("TrackerWatchlistListContainer", () => {
  it("renders ConnectedViews through Models > Controllers composition", () => {
    const { toJSON } = render(<TrackerWatchlistListContainer />);
    expect(toJSON()).toBe("WatchlistListViews:default");
  });
});

// Silence unused-React warning.
void React;
