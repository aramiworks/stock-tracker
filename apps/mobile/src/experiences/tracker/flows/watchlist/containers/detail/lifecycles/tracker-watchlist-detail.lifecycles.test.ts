import { renderHook } from "@testing-library/react-native";
import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";
import { useRefetchOnRestock } from "@/shared/hooks/use-refetch-on-restock";
import { useTrackerWatchlistDetailLifecycle } from "./tracker-watchlist-detail.lifecycles";

jest.mock("@/shared/hooks/use-refetch-on-focus", () => ({
  useRefetchOnFocus: jest.fn(),
}));

jest.mock("@/shared/hooks/use-refetch-on-restock", () => ({
  useRefetchOnRestock: jest.fn(),
}));

describe("useTrackerWatchlistDetailLifecycle", () => {
  it("delegates to useRefetchOnFocus with the provided refetch function", () => {
    const refetch = jest.fn();
    renderHook(() => useTrackerWatchlistDetailLifecycle(refetch));
    expect(useRefetchOnFocus).toHaveBeenCalledWith(refetch);
  });

  it("subscribes the same refetch to the restock channel", () => {
    const refetch = jest.fn();
    renderHook(() => useTrackerWatchlistDetailLifecycle(refetch));
    expect(useRefetchOnRestock).toHaveBeenCalledWith(refetch);
  });
});
