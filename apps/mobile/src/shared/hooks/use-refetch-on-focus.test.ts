import { renderHook } from "@testing-library/react-native";
import { useFocusEffect } from "expo-router";
import { useRefetchOnFocus } from "./use-refetch-on-focus";

jest.mock("expo-router", () => ({
  useFocusEffect: jest.fn((cb: () => void) => cb()),
}));

describe("useRefetchOnFocus", () => {
  it("calls refetch via useFocusEffect", () => {
    const refetch = jest.fn();
    renderHook(() => useRefetchOnFocus(refetch));
    expect(useFocusEffect).toHaveBeenCalled();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("calls refetch again on re-focus", () => {
    const refetch = jest.fn();
    const { unmount } = renderHook(() => useRefetchOnFocus(refetch));
    expect(refetch).toHaveBeenCalledTimes(1);
    unmount();

    renderHook(() => useRefetchOnFocus(refetch));
    expect(refetch).toHaveBeenCalledTimes(2);
  });
});
