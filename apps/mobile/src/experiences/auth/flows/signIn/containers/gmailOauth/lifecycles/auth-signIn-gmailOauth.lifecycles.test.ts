import { renderHook } from "@testing-library/react-native";
import { useAuthSignInGmailOauthLifecycle } from "./auth-signIn-gmailOauth.lifecycles";

describe("useAuthSignInGmailOauthLifecycle", () => {
  it("can be called without error", () => {
    renderHook(() => useAuthSignInGmailOauthLifecycle());
  });
});
