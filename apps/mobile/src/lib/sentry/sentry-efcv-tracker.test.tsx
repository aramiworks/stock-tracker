import React from "react";
import { render } from "@testing-library/react-native";

jest.mock("./efcv-cache", () => ({
  setCurrentEfcv: jest.fn(),
}));

jest.mock("./get-efcv-from-route", () => ({
  getEfcvFromSegments: jest.fn(() => ({ experience: "tracker" })),
}));

import { SentryEfcvTracker } from "./sentry-efcv-tracker";

describe("SentryEfcvTracker", () => {
  it("renders null and syncs efcv tags on mount", () => {
    const { setCurrentEfcv } = jest.requireMock("./efcv-cache") as {
      setCurrentEfcv: jest.Mock;
    };
    const { getEfcvFromSegments } = jest.requireMock(
      "./get-efcv-from-route",
    ) as { getEfcvFromSegments: jest.Mock };
    const { toJSON } = render(<SentryEfcvTracker />);
    expect(toJSON()).toBeNull();
    expect(getEfcvFromSegments).toHaveBeenCalledWith([]);
    expect(setCurrentEfcv).toHaveBeenCalledWith({ experience: "tracker" });
  });
});
