import { renderHook } from "@testing-library/react-native";
import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";
import { useTrackerAccountsListLifecycle } from "./tracker-accounts-list.lifecycles";

jest.mock("@/shared/hooks/use-refetch-on-focus", () => ({
  useRefetchOnFocus: jest.fn(),
}));

describe("useTrackerAccountsListLifecycle", () => {
  it("calls useRefetchOnFocus with the provided refetch function", () => {
    const refetch = jest.fn();
    renderHook(() => useTrackerAccountsListLifecycle(refetch));
    expect(useRefetchOnFocus).toHaveBeenCalledWith(refetch);
  });
});
