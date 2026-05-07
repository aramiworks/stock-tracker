import { renderHook } from "@testing-library/react-native";
import { useTrackerAccountHomeLifecycle } from "./tracker-account-home.lifecycles";

describe("useTrackerAccountHomeLifecycle", () => {
  it("runs without error", () => {
    expect(() => {
      renderHook(() => useTrackerAccountHomeLifecycle());
    }).not.toThrow();
  });
});
