import { useTrackerHistoryStore } from "./tracker-history.store";

describe("tracker-history.store", () => {
  it("creates store with empty initial state", () => {
    const state = useTrackerHistoryStore.getState();
    expect(state).toEqual({});
  });
});
