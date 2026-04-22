import { renderHook } from "@testing-library/react-native";
import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";
import { useTrackerHistoryBrowseLifecycle } from "./tracker-history-browse.lifecycles";

jest.mock("@/shared/hooks/use-refetch-on-focus", () => ({
  useRefetchOnFocus: jest.fn(),
}));

describe("useTrackerHistoryBrowseLifecycle", () => {
  it("calls useRefetchOnFocus with the provided refetch function", () => {
    const refetch = jest.fn();
    renderHook(() => useTrackerHistoryBrowseLifecycle(refetch));
    expect(useRefetchOnFocus).toHaveBeenCalledWith(refetch);
  });
});
