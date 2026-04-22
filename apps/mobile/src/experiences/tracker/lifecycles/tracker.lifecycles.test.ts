import { renderHook } from "@testing-library/react-native";
import { useTrackerLifecycle } from "./tracker.lifecycles";

describe("useTrackerLifecycle", () => {
  it("can be called without error", () => {
    renderHook(() => useTrackerLifecycle());
  });
});
