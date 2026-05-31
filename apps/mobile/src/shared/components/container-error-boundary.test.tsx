/* eslint-disable react/prop-types -- jest factory stub uses untyped props */
const mockCaptureException = jest.fn();

// Stub @sentry/react-native with a minimal ErrorBoundary mirroring the real
// SDK contract: catches render errors, renders the user-provided fallback with
// a `resetError` callback, and reports the error to Sentry.captureException in
// componentDidCatch. The factory is hoisted by jest, so we require React
// lazily inside it and avoid out-of-scope identifiers (including type names).
jest.mock("@sentry/react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  class StubErrorBoundary extends React.Component {
    constructor(props: unknown) {
      super(props);
      this.state = { error: null };
      this.resetError = () => this.setState({ error: null });
    }
    state: { error: Error | null };
    resetError: () => void;
    static getDerivedStateFromError(error: Error) {
      return { error };
    }
    componentDidCatch(error: Error) {
      mockCaptureException(error);
    }
    render() {
      if (this.state.error) {
        return this.props.fallback({
          error: this.state.error,
          componentStack: "",
          eventId: "test-event-id",
          resetError: this.resetError,
        });
      }
      return this.props.children;
    }
  }
  return {
    __esModule: true,
    ErrorBoundary: StubErrorBoundary,
    captureException: mockCaptureException,
  };
});

import React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { ContainerErrorBoundary } from "./container-error-boundary";

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("test error");
  return <Text>children content</Text>;
}

// Suppress expected console.error from render-phase throws
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

beforeEach(() => {
  mockCaptureException.mockClear();
});

describe("ContainerErrorBoundary", () => {
  it("renders children when no error", () => {
    const { getByText } = render(
      <ContainerErrorBoundary
        fallback={({ retry }) => <Text onPress={retry}>retry</Text>}
      >
        <ThrowingChild shouldThrow={false} />
      </ContainerErrorBoundary>,
    );
    expect(getByText("children content")).toBeTruthy();
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it("renders fallback when child throws and reports to Sentry", () => {
    const { getByText, queryByText } = render(
      <ContainerErrorBoundary
        fallback={({ retry }) => <Text onPress={retry}>retry</Text>}
      >
        <ThrowingChild shouldThrow={true} />
      </ContainerErrorBoundary>,
    );
    expect(queryByText("children content")).toBeNull();
    expect(getByText("retry")).toBeTruthy();
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect((mockCaptureException.mock.calls[0]?.[0] as Error).message).toBe(
      "test error",
    );
  });

  it("resets error state on retry", () => {
    let shouldThrow = true;
    function ConditionalThrow() {
      if (shouldThrow) throw new Error("test error");
      return <Text>recovered</Text>;
    }

    const { getByText } = render(
      <ContainerErrorBoundary
        fallback={({ retry }) => <Text onPress={retry}>retry</Text>}
      >
        <ConditionalThrow />
      </ContainerErrorBoundary>,
    );

    expect(getByText("retry")).toBeTruthy();

    shouldThrow = false;
    fireEvent.press(getByText("retry"));
    expect(getByText("recovered")).toBeTruthy();
  });
});
