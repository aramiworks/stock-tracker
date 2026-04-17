import React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { QueryErrorBoundary } from "./query-error-boundary";

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("test error");
  return <Text>children content</Text>;
}

// Suppress console.error for expected error boundary triggers
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const combined = args.map(String).join(" ");
    if (combined.includes("test error")) return;
    if (combined.includes("The above error occurred")) return;
    if (combined.includes("Error: Uncaught")) return;
    if (combined.includes("recreate this component tree")) return;
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

describe("QueryErrorBoundary", () => {
  it("renders children when no error", () => {
    const { getByText } = render(
      <QueryErrorBoundary
        fallback={({ retry }) => <Text onPress={retry}>retry</Text>}
      >
        <ThrowingChild shouldThrow={false} />
      </QueryErrorBoundary>,
    );
    expect(getByText("children content")).toBeTruthy();
  });

  it("renders fallback when child throws", () => {
    const { getByText, queryByText } = render(
      <QueryErrorBoundary
        fallback={({ retry }) => <Text onPress={retry}>retry</Text>}
      >
        <ThrowingChild shouldThrow={true} />
      </QueryErrorBoundary>,
    );
    expect(queryByText("children content")).toBeNull();
    expect(getByText("retry")).toBeTruthy();
  });

  it("resets error state on retry", () => {
    let shouldThrow = true;
    function ConditionalThrow() {
      if (shouldThrow) throw new Error("test error");
      return <Text>recovered</Text>;
    }

    const { getByText } = render(
      <QueryErrorBoundary
        fallback={({ retry }) => <Text onPress={retry}>retry</Text>}
      >
        <ConditionalThrow />
      </QueryErrorBoundary>,
    );

    expect(getByText("retry")).toBeTruthy();

    shouldThrow = false;
    fireEvent.press(getByText("retry"));
    expect(getByText("recovered")).toBeTruthy();
  });
});
