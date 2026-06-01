const mockRegisterNavigationContainer = jest.fn();

jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  mobileReplayIntegration: jest.fn(() => ({ name: "MobileReplay" })),
  reactNavigationIntegration: jest.fn(() => ({
    name: "ReactNavigation",
    registerNavigationContainer: mockRegisterNavigationContainer,
  })),
}));

jest.mock("./efcv-cache", () => ({
  getCurrentEfcv: jest.fn(() => ({ experience: "tracker", flow: "dashboard" })),
}));

import { initSentry, registerSentryNavigationContainer } from "./sentry";

const TEST_DSN = "https://key@sentry.io/123";

describe("initSentry", () => {
  const sentryMock = jest.requireMock("@sentry/react-native") as {
    init: jest.Mock;
    reactNavigationIntegration: jest.Mock;
  };
  const efcvMock = jest.requireMock("./efcv-cache") as {
    getCurrentEfcv: jest.Mock;
  };

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
    jest.clearAllMocks();
  });

  it("does not call Sentry.init when DSN is not set", () => {
    initSentry();
    expect(sentryMock.init).not.toHaveBeenCalled();
  });

  it("registerSentryNavigationContainer no-ops when initSentry has not been called", () => {
    const ref = { current: {} };
    registerSentryNavigationContainer(ref);
    expect(mockRegisterNavigationContainer).not.toHaveBeenCalled();
  });

  it("calls Sentry.init with the DSN when set", () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = TEST_DSN;
    initSentry();
    expect(sentryMock.init).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: TEST_DSN }),
    );
  });

  it("beforeSend merges EFCV tags onto the event", () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = TEST_DSN;
    initSentry();
    const { beforeSend } = sentryMock.init.mock.calls[0][0];
    const event = { tags: { existing: "tag" } };
    const result = beforeSend(event);
    expect(result).toEqual({
      tags: { existing: "tag", experience: "tracker", flow: "dashboard" },
    });
  });

  it("beforeSend returns event even when getCurrentEfcv throws", () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = TEST_DSN;
    efcvMock.getCurrentEfcv.mockImplementationOnce(() => {
      throw new Error("oops");
    });
    initSentry();
    const { beforeSend } = sentryMock.init.mock.calls[0][0];
    const event = { tags: {} };
    const result = beforeSend(event);
    expect(result).toEqual({ tags: {} });
  });

  it("includes the React Navigation integration with TTID enabled", () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = TEST_DSN;
    initSentry();
    expect(sentryMock.reactNavigationIntegration).toHaveBeenCalledWith({
      enableTimeToInitialDisplay: true,
    });
    const initCall = sentryMock.init.mock.calls[0][0];
    expect(initCall.integrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "ReactNavigation" }),
      ]),
    );
  });

  it("registerSentryNavigationContainer forwards the ref to the integration after init", () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = TEST_DSN;
    initSentry();
    const ref = { current: {} };
    registerSentryNavigationContainer(ref);
    expect(mockRegisterNavigationContainer).toHaveBeenCalledWith(ref);
  });
});
