import { renderHook } from "@testing-library/react-native";
import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";
import { useTrackerAccountsDetailLifecycle } from "./tracker-accounts-detail.lifecycles";

jest.mock("@/shared/hooks/use-refetch-on-focus", () => ({
  useRefetchOnFocus: jest.fn(),
}));

describe("useTrackerAccountsDetailLifecycle", () => {
  it("calls useRefetchOnFocus with the provided refetch function", () => {
    const refetch = jest.fn();
    renderHook(() => useTrackerAccountsDetailLifecycle(refetch));
    expect(useRefetchOnFocus).toHaveBeenCalledWith(refetch);
  });
});
