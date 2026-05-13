jest.mock("./models/tracker-watchlist-detail.models", () => ({
  TrackerWatchlistDetailModels: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
}));

jest.mock("./controllers/tracker-watchlist-detail.controllers", () => ({
  TrackerWatchlistDetailControllers: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
  useTrackerWatchlistDetailControllers: () => ({
    screenState: "default",
    payload: null,
    onBack: jest.fn(),
  }),
}));

jest.mock("./views/tracker-watchlist-detail.views", () => ({
  TrackerWatchlistDetailViews: (props: Record<string, unknown>) =>
    `WatchlistDetailViews:${props.screenState ?? "default"}`,
}));

jest.mock("@/shared/components/query-error-boundary", () => ({
  QueryErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

import React from "react";
import { render } from "@testing-library/react-native";
import { TrackerWatchlistDetailContainer } from "./tracker-watchlist-detail.container";

describe("TrackerWatchlistDetailContainer", () => {
  it("renders ConnectedViews through Models > Controllers composition", () => {
    const { toJSON } = render(
      <TrackerWatchlistDetailContainer watchableUnitId="unit-1" />,
    );
    expect(toJSON()).toBe("WatchlistDetailViews:default");
  });
});

void React;
