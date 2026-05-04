import { useTrackerAccountsStore } from "./tracker-accounts.store";

describe("tracker-accounts.store", () => {
  it("creates store with empty initial state", () => {
    const state = useTrackerAccountsStore.getState();
    expect(state).toEqual({});
  });
});
