import { useTrackerStore } from "./tracker.store";

describe("tracker.store", () => {
  it("creates store with empty initial state", () => {
    const state = useTrackerStore.getState();
    expect(state).toEqual({});
  });
});
