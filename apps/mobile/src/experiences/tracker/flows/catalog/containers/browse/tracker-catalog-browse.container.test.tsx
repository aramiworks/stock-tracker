/* eslint-disable react/prop-types -- jest factory stub uses untyped props */
import { render } from "@testing-library/react-native";

const mockRefetch = jest.fn().mockResolvedValue(undefined);
const mockCaptureException = jest.fn();

// Stub @sentry/react-native because jest.spyOn cannot redefine ESM exports.
// The stub ErrorBoundary mirrors the real SDK: catches render errors, renders
// the fallback, and reports to captureException in componentDidCatch. The
// factory is hoisted, so we require React lazily and avoid out-of-scope refs.
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

jest.mock("@apollo/client/react", () => ({
  useSuspenseQuery: jest.fn(),
}));

jest.mock("@/shared/hooks/use-refetch-on-focus", () => ({
  useRefetchOnFocus: jest.fn(),
}));

import { useSuspenseQuery } from "@apollo/client/react";
import { TrackerCatalogBrowseContainer } from "./tracker-catalog-browse.container";
import { CATALOG_MOCK_GROUPS } from "./models/tracker-catalog-browse.mock";

const useSuspenseQueryMock = useSuspenseQuery as unknown as jest.Mock;

// Suppress console.error noise from intentional render-phase throws below.
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const combined = args.map(String).join(" ");
    if (combined.includes("catalog boundary smoke")) return;
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
  useSuspenseQueryMock.mockReset();
  useSuspenseQueryMock.mockReturnValue({
    data: { catalogList: CATALOG_MOCK_GROUPS },
    refetch: mockRefetch,
  });
  mockCaptureException.mockClear();
});

describe("TrackerCatalogBrowseContainer", () => {
  it("renders the catalog browse screen with real query data", () => {
    const { getByTestId } = render(<TrackerCatalogBrowseContainer />);
    expect(getByTestId("catalog-browse-screen")).toBeTruthy();
  });

  it("renders the error fallback and reports to Sentry when a render error throws", () => {
    useSuspenseQueryMock.mockImplementation(() => {
      throw new Error("catalog boundary smoke");
    });

    const { getByTestId } = render(<TrackerCatalogBrowseContainer />);

    expect(getByTestId("catalog-empty-state")).toBeTruthy();
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect((mockCaptureException.mock.calls[0]?.[0] as Error).message).toBe(
      "catalog boundary smoke",
    );
  });
});
