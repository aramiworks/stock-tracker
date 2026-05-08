jest.mock("./models", () => ({
  TrackerAccountHomeModels: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock("./controllers", () => ({
  TrackerAccountHomeControllers: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
  useTrackerAccountHomeControllers: () => ({
    email: "test@example.com",
    createdAt: "2024-01-01T00:00:00Z",
    signOut: jest.fn(),
    isSigningOut: false,
  }),
}));

jest.mock("./views", () => ({
  TrackerAccountHomeViews: () => "AccountHomeViews:rendered",
}));

jest.mock("@/shared/components/query-error-boundary", () => ({
  QueryErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

import React from "react";
import { render } from "@testing-library/react-native";
import { TrackerAccountHomeContainer } from "./tracker-account-home.container";

describe("TrackerAccountHomeContainer", () => {
  it("renders ConnectedViews through Models > Controllers composition", () => {
    const { toJSON } = render(<TrackerAccountHomeContainer />);
    expect(toJSON()).toBe("AccountHomeViews:rendered");
  });
});
