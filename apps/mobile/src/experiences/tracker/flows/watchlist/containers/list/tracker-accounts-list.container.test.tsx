jest.mock("./models", () => ({
  TrackerAccountsListModels: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock("./controllers", () => ({
  TrackerAccountsListControllers: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
  useTrackerAccountsListControllers: () => ({ screenState: "default" }),
}));

jest.mock("./views", () => ({
  TrackerAccountsListViews: (props: Record<string, unknown>) =>
    `AccountsListViews:${props.screenState ?? "default"}`,
}));

jest.mock("@/shared/components/query-error-boundary", () => ({
  QueryErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

import React from "react";
import { render } from "@testing-library/react-native";
import { TrackerAccountsListContainer } from "./tracker-accounts-list.container";

describe("TrackerAccountsListContainer", () => {
  it("renders ConnectedViews through Models > Controllers composition", () => {
    const { toJSON } = render(<TrackerAccountsListContainer />);
    expect(toJSON()).toBe("AccountsListViews:default");
  });
});
