import React from "react";
import { render } from "@testing-library/react-native";

jest.mock("../sentry/get-efcv-from-route", () => ({
  getEfcvFromSegments: jest.fn(() => ({
    experience: "tracker",
    flow: "dashboard",
    container: "home",
  })),
}));

jest.mock("./analytics", () => ({
  trackScreen: jest.fn().mockResolvedValue(undefined),
}));

import { AnalyticsScreenTracker } from "./analytics-screen-tracker";

describe("AnalyticsScreenTracker", () => {
  it("renders null and emits trackScreen on mount", () => {
    const { trackScreen } = jest.requireMock("./analytics") as {
      trackScreen: jest.Mock;
    };
    const { getEfcvFromSegments } = jest.requireMock(
      "../sentry/get-efcv-from-route",
    ) as { getEfcvFromSegments: jest.Mock };

    const { toJSON } = render(<AnalyticsScreenTracker />);
    expect(toJSON()).toBeNull();
    expect(getEfcvFromSegments).toHaveBeenCalledWith([]);
    expect(trackScreen).toHaveBeenCalledWith("tracker", "dashboard", "home");
  });
});
