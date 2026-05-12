import { useTrackerDashboardStore } from "./tracker-dashboard.store";

describe("tracker-dashboard.store", () => {
  it("creates store with empty initial state", () => {
    const state = useTrackerDashboardStore.getState();
    expect(state).toEqual({});
  });
});
