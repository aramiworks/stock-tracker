import { renderHook, act } from "@testing-library/react-native";
import { supabase } from "../../../lib/supabase";
import { setSession } from "../models/auth.store";

jest.mock("../models/auth.store", () => ({
  setSession: jest.fn(),
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

    const { useAuthLifecycle } = require("./auth.lifecycles");
    renderHook(() => useAuthLifecycle());

    await act(async () => {
      await Promise.resolve();
    });

    expect(setSession).toHaveBeenCalledWith(mockSession);
  });

  it("calls setSession(null) when getSession returns null session", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    const { useAuthLifecycle } = require("./auth.lifecycles");
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

    const { useAuthLifecycle } = require("./auth.lifecycles");
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

    const { useAuthLifecycle } = require("./auth.lifecycles");
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

    const { useAuthLifecycle } = require("./auth.lifecycles");
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

    const { useAuthLifecycle } = require("./auth.lifecycles");
    renderHook(() => useAuthLifecycle());

    const changeCallback = (supabase.auth.onAuthStateChange as jest.Mock).mock
      .calls[0]![0];
    const newSession = { access_token: "new" };
    changeCallback("SIGNED_IN", newSession);

    expect(setSession).toHaveBeenCalledWith(newSession);
  });

  it("cleans up timeout and subscription on unmount", () => {
    (supabase.auth.getSession as jest.Mock).mockReturnValueOnce(
      new Promise(() => {}),
    );

    const mockUnsubscribe = jest.fn();
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValueOnce({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });

    const { useAuthLifecycle } = require("./auth.lifecycles");
    const { unmount } = renderHook(() => useAuthLifecycle());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
