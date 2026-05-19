import { renderHook } from "@testing-library/react-native";
import { useTrackerAlertHistoryLifecycle } from "./tracker-alertHistory.lifecycles";

describe("useTrackerAlertHistoryLifecycle", () => {
  it("runs without throwing (stub flow-level lifecycle)", () => {
    expect(() => renderHook(() => useTrackerAlertHistoryLifecycle())).not.toThrow();
  });
});
