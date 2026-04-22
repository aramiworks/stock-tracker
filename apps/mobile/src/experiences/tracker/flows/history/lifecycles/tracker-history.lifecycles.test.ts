import { renderHook } from "@testing-library/react-native";
import { useTrackerHistoryLifecycle } from "./tracker-history.lifecycles";

describe("useTrackerHistoryLifecycle", () => {
  it("can be called without error", () => {
    renderHook(() => useTrackerHistoryLifecycle());
  });
});
