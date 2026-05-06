import { renderHook, act } from "@testing-library/react-native";
import { supabase } from "../../../lib/supabase";
import { identifyUser, resetAnalytics } from "../../../lib/analytics";
import { setSession } from "../models/auth.store";
import { useAuthLifecycle } from "./auth.lifecycles";

jest.mock("../models/auth.store", () => ({
  setSession: jest.fn(),
}));

jest.mock("../../../lib/analytics", () => ({
  identifyUser: jest.fn().mockResolvedValue(undefined),
  resetAnalytics: jest.fn().mockResolvedValue(undefined),
}));

describe("useAuthLifecycle", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("calls setSession with session on successful getSession", async () => {
    const mockSession = { access_token: "tok" };
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
    });

    renderHook(() => useAuthLifecycle());

    await act(async () => {
      await Promise.resolve();
    });

    expect(setSession).toHaveBeenCalledWith(mockSession);
    expect(identifyUser).not.toHaveBeenCalled();
  });

  it("identifies the user on initial getSession with a user id", async () => {
    const mockSession = { access_token: "tok", user: { id: "user-1" } };
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
    });

    renderHook(() => useAuthLifecycle());

    await act(async () => {
      await Promise.resolve();
    });

    expect(identifyUser).toHaveBeenCalledWith("user-1");
  });

  it("calls setSession(null) when getSession returns null session", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    renderHook(() => useAuthLifecycle());

    await act(async () => {
      await Promise.resolve();
    });

    expect(setSession).toHaveBeenCalledWith(null);
  });

  it("calls setSession(null) when getSession rejects", async () => {
    (supabase.auth.getSession as jest.Mock).mockRejectedValueOnce(
      new Error("fail"),
    );

    renderHook(() => useAuthLifecycle());

    await act(async () => {
      await Promise.resolve();
    });

    expect(setSession).toHaveBeenCalledWith(null);
  });

  it("calls setSession(null) on timeout when getSession hangs", async () => {
    (supabase.auth.getSession as jest.Mock).mockReturnValueOnce(
      new Promise(() => {}),
    );

    renderHook(() => useAuthLifecycle());

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(setSession).toHaveBeenCalledWith(null);
  });

  it("does not double-settle after timeout if getSession resolves late", async () => {
    let resolve: (v: unknown) => void;
    (supabase.auth.getSession as jest.Mock).mockReturnValueOnce(
      new Promise((r) => {
        resolve = r;
      }),
    );

    renderHook(() => useAuthLifecycle());

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(setSession).toHaveBeenCalledTimes(1);
    expect(setSession).toHaveBeenCalledWith(null);

    await act(async () => {
      resolve!({ data: { session: { access_token: "late" } } });
      await Promise.resolve();
    });

    // Should still be 1 — the late resolve is ignored
    expect(setSession).toHaveBeenCalledTimes(1);
  });

  it("subscribes to onAuthStateChange and forwards sessions", () => {
    (supabase.auth.getSession as jest.Mock).mockReturnValueOnce(
      new Promise(() => {}),
    );

    renderHook(() => useAuthLifecycle());

    const changeCallback = (supabase.auth.onAuthStateChange as jest.Mock).mock
      .calls[0]![0];
    const newSession = { access_token: "new", user: { id: "user-2" } };
    changeCallback("SIGNED_IN", newSession);

    expect(setSession).toHaveBeenCalledWith(newSession);
    expect(identifyUser).toHaveBeenCalledWith("user-2");
    expect(resetAnalytics).not.toHaveBeenCalled();
  });

  it("resets analytics on SIGNED_OUT events", () => {
    (supabase.auth.getSession as jest.Mock).mockReturnValueOnce(
      new Promise(() => {}),
    );

    renderHook(() => useAuthLifecycle());

    const changeCallback = (supabase.auth.onAuthStateChange as jest.Mock).mock
      .calls[0]![0];
    changeCallback("SIGNED_OUT", null);

    expect(setSession).toHaveBeenCalledWith(null);
    expect(resetAnalytics).toHaveBeenCalled();
    expect(identifyUser).not.toHaveBeenCalled();
  });

  it("does not identify on non-SIGNED_OUT events without a user id", () => {
    (supabase.auth.getSession as jest.Mock).mockReturnValueOnce(
      new Promise(() => {}),
    );

    renderHook(() => useAuthLifecycle());

    const changeCallback = (supabase.auth.onAuthStateChange as jest.Mock).mock
      .calls[0]![0];
    changeCallback("TOKEN_REFRESHED", null);

    expect(identifyUser).not.toHaveBeenCalled();
    expect(resetAnalytics).not.toHaveBeenCalled();
  });

  it("cleans up timeout and subscription on unmount", () => {
    (supabase.auth.getSession as jest.Mock).mockReturnValueOnce(
      new Promise(() => {}),
    );

    const mockUnsubscribe = jest.fn();
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValueOnce({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    const { unmount } = renderHook(() => useAuthLifecycle());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
