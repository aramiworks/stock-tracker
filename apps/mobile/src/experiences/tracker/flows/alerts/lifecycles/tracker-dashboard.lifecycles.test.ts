import { renderHook } from "@testing-library/react-native";
import { useTrackerDashboardLifecycle } from "./tracker-dashboard.lifecycles";

describe("useTrackerDashboardLifecycle", () => {
  it("can be called without error", () => {
    renderHook(() => useTrackerDashboardLifecycle());
  });
});
