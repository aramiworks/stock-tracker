jest.mock("./models", () => ({
  TrackerAccountsDetailModels: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock("./controllers", () => ({
  TrackerAccountsDetailControllers: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
  useTrackerAccountsDetailControllers: () => ({ screenState: "default" }),
}));

jest.mock("./views", () => ({
  TrackerAccountsDetailViews: (props: Record<string, unknown>) =>
    `AccountsDetailViews:${props.screenState ?? "default"}`,
}));

jest.mock("@/shared/components/container-error-boundary", () => ({
  ContainerErrorBoundary: ({ children }: { children: React.ReactNode }) =>
    children,
}));

import React from "react";
import { render } from "@testing-library/react-native";
import { TrackerAccountsDetailContainer } from "./tracker-accounts-detail.container";

describe("TrackerAccountsDetailContainer", () => {
  it("renders ConnectedViews with accountId prop", () => {
    const { toJSON } = render(
      <TrackerAccountsDetailContainer accountId="acc-1" />,
    );
    expect(toJSON()).toBe("AccountsDetailViews:default");
  });
});
