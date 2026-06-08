import { renderHook } from "@testing-library/react-native";
import { emitRestock, useRefetchOnRestock } from "./use-refetch-on-restock";

describe("useRefetchOnRestock", () => {
  it("invokes the subscribed refetch when a restock is emitted", () => {
    const refetch = jest.fn();
    renderHook(() => useRefetchOnRestock(refetch));

    emitRestock();

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("notifies every subscribed listener", () => {
    const a = jest.fn();
    const b = jest.fn();
    renderHook(() => useRefetchOnRestock(a));
    renderHook(() => useRefetchOnRestock(b));

    emitRestock();

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes on unmount", () => {
    const refetch = jest.fn();
    const { unmount } = renderHook(() => useRefetchOnRestock(refetch));

    unmount();
    emitRestock();

    expect(refetch).not.toHaveBeenCalled();
  });

  it("re-subscribes when the refetch identity changes", () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(
      ({ fn }: { fn: () => void }) => useRefetchOnRestock(fn),
      { initialProps: { fn: first } },
    );

    rerender({ fn: second });
    emitRestock();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("is a no-op when nothing is subscribed", () => {
    expect(() => emitRestock()).not.toThrow();
  });
});
