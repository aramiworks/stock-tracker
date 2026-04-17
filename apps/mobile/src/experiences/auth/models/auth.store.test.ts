import { useAuthStore, setSession, setLoading } from "./auth.store";
import type { Session } from "@supabase/supabase-js";

const mockSession = {
  access_token: "test-token",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "test-refresh",
  user: {
    id: "user-1",
    aud: "authenticated",
    role: "authenticated",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {},
    created_at: "2024-01-01",
  },
} as unknown as Session;

beforeEach(() => {
  useAuthStore.setState({
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });
});

describe("auth.store", () => {
  describe("initial state", () => {
    it("has null session, isLoading true, isAuthenticated false", () => {
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.isLoading).toBe(true);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("setSession", () => {
    it("sets session and marks authenticated", () => {
      setSession(mockSession);
      const state = useAuthStore.getState();
      expect(state.session).toBe(mockSession);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it("clears session and marks unauthenticated when null", () => {
      setSession(mockSession);
      setSession(null);
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("setLoading", () => {
    it("updates isLoading to true", () => {
      setLoading(false);
      setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it("updates isLoading to false", () => {
      setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
