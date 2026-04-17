import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";

jest.mock("@apollo/client/react", () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("@apollo/client/testing/react", () => ({
  MockedProvider: ({
    children,
  }: {
    children: React.ReactNode;
    mocks: unknown[];
  }) => <>{children}</>,
}));

jest.mock("./client", () => ({
  createApolloClient: jest.fn(() => ({ __mock: true })),
}));

jest.mock("./mocks", () => ({
  trackerMocks: [],
}));

describe("AppApolloProvider", () => {
  const originalEnv = process.env.EXPO_PUBLIC_GRAPHQL_URL;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.EXPO_PUBLIC_GRAPHQL_URL = originalEnv;
    } else {
      delete process.env.EXPO_PUBLIC_GRAPHQL_URL;
    }
    jest.resetModules();
  });

  it("renders children with MockedProvider when no GRAPHQL_URL", () => {
    delete process.env.EXPO_PUBLIC_GRAPHQL_URL;
    const { AppApolloProvider } =
      require("./provider") as typeof import("./provider");
    const { getByText } = render(
      <AppApolloProvider>
        <Text>child</Text>
      </AppApolloProvider>,
    );
    expect(getByText("child")).toBeTruthy();
  });

  it("renders children with ApolloProvider when GRAPHQL_URL is set", () => {
    process.env.EXPO_PUBLIC_GRAPHQL_URL = "http://localhost:4002";
    const { AppApolloProvider } =
      require("./provider") as typeof import("./provider");
    const { getByText } = render(
      <AppApolloProvider>
        <Text>child</Text>
      </AppApolloProvider>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
