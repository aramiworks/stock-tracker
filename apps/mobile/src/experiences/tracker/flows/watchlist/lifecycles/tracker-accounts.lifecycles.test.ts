import { renderHook } from "@testing-library/react-native";
import { useTrackerAccountsLifecycle } from "./tracker-accounts.lifecycles";

describe("useTrackerAccountsLifecycle", () => {
  it("can be called without error", () => {
    renderHook(() => useTrackerAccountsLifecycle());
  });
});
