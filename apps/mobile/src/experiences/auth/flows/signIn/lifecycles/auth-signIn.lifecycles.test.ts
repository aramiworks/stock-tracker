import { renderHook } from "@testing-library/react-native";
import { useAuthSignInLifecycle } from "./auth-signIn.lifecycles";

describe("useAuthSignInLifecycle", () => {
  it("can be called without error", () => {
    renderHook(() => useAuthSignInLifecycle());
  });
});
