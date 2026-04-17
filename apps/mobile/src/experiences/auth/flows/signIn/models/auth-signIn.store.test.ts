import { useAuthSignInStore } from "./auth-signIn.store";

describe("auth-signIn.store", () => {
  it("creates store with empty initial state", () => {
    const state = useAuthSignInStore.getState();
    expect(state).toEqual({});
  });
});
