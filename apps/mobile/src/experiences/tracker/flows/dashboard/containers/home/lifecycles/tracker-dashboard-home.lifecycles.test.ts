import { renderHook } from "@testing-library/react-native";
import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";
import { useTrackerDashboardHomeLifecycle } from "./tracker-dashboard-home.lifecycles";

jest.mock("@/shared/hooks/use-refetch-on-focus", () => ({
  useRefetchOnFocus: jest.fn(),
}));

describe("useTrackerDashboardHomeLifecycle", () => {
  it("calls useRefetchOnFocus with the provided refetch function", () => {
    const refetch = jest.fn();
    renderHook(() => useTrackerDashboardHomeLifecycle(refetch));
    expect(useRefetchOnFocus).toHaveBeenCalledWith(refetch);
  });
});
