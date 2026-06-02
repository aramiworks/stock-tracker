jest.mock("@sentry/react-native", () => ({
  setUser: jest.fn(),
}));

import * as Sentry from "@sentry/react-native";
import { identifySentryUser, resetSentryUser } from "./identify-sentry-user";

const setUserMock = Sentry.setUser as jest.Mock;

describe("identifySentryUser / resetSentryUser", () => {
  afterEach(() => {
    setUserMock.mockClear();
  });

  it("forwards the id (and only the id) to Sentry.setUser", () => {
    identifySentryUser("user-123");
    expect(setUserMock).toHaveBeenCalledWith({ id: "user-123" });
  });

  it("clears the Sentry user context on reset", () => {
    resetSentryUser();
    expect(setUserMock).toHaveBeenCalledWith(null);
  });
});
