jest.mock("./models", () => ({
  TrackerHistoryBrowseModels: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock("./controllers", () => ({
  TrackerHistoryBrowseControllers: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
  useTrackerHistoryBrowseControllers: () => ({ screenState: "default" }),
}));

jest.mock("./views", () => ({
  TrackerHistoryBrowseViews: (props: Record<string, unknown>) =>
    `HistoryBrowseViews:${props.screenState ?? "default"}`,
}));

jest.mock("@/shared/components/query-error-boundary", () => ({
  QueryErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

import React from "react";
import { render } from "@testing-library/react-native";
import { TrackerHistoryBrowseContainer } from "./tracker-history-browse.container";

describe("TrackerHistoryBrowseContainer", () => {
  it("renders ConnectedViews through Models > Controllers composition", () => {
    const { toJSON } = render(<TrackerHistoryBrowseContainer />);
    expect(toJSON()).toBe("HistoryBrowseViews:default");
  });
});
