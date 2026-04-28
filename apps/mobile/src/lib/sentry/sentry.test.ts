jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  mobileReplayIntegration: jest.fn(() => ({})),
}));

jest.mock("./efcv-cache", () => ({
  getCurrentEfcv: jest.fn(() => ({ experience: "tracker", flow: "dashboard" })),
}));

import { initSentry } from "./sentry";

const TEST_DSN = "https://key@sentry.io/123";

describe("initSentry", () => {
  const sentryMock = jest.requireMock("@sentry/react-native") as {
    init: jest.Mock;
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
});
