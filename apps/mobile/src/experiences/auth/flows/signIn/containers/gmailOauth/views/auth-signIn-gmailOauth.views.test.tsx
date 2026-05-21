import { render, fireEvent } from "@testing-library/react-native";
import { AuthSignInGmailOauthViews } from "./auth-signIn-gmailOauth.views";

describe("AuthSignInGmailOauthViews", () => {
  it("renders the default state with welcome, sign-in button, and terms", () => {
    const { getByTestId } = render(
      <AuthSignInGmailOauthViews screenState="default" />,
    );
    expect(getByTestId("auth-signIn-gmailOauth-screen")).toBeTruthy();
    expect(getByTestId("auth-signIn-header")).toBeTruthy();
    expect(getByTestId("auth-signIn-welcome")).toBeTruthy();
    expect(getByTestId("sign-in-google-button")).toBeTruthy();
    expect(getByTestId("auth-signIn-terms")).toBeTruthy();
  });

  it("calls signInWithGoogle when the sign-in button is pressed", () => {
    const signInWithGoogle = jest.fn();
    const { getByTestId } = render(
      <AuthSignInGmailOauthViews
        screenState="default"
        signInWithGoogle={signInWithGoogle}
        isSigningIn={false}
      />,
    );
    fireEvent.press(getByTestId("sign-in-google-button"));
    expect(signInWithGoogle).toHaveBeenCalled();
  });

  it("renders the loading state with progress indicator and caption", () => {
    const { getByTestId, queryByTestId } = render(
      <AuthSignInGmailOauthViews screenState="loading" />,
    );
    expect(getByTestId("auth-signIn-loading-state")).toBeTruthy();
    expect(getByTestId("auth-signIn-loading-caption")).toBeTruthy();
    expect(queryByTestId("sign-in-google-button")).toBeNull();
  });

  it("derives loading state from isSigningIn when screenState is omitted", () => {
    const { getByTestId, queryByTestId } = render(
      <AuthSignInGmailOauthViews isSigningIn />,
    );
    expect(getByTestId("auth-signIn-loading-state")).toBeTruthy();
    expect(queryByTestId("sign-in-google-button")).toBeNull();
  });

  it("falls back to default state when screenState and isSigningIn are both omitted", () => {
    const { getByTestId } = render(<AuthSignInGmailOauthViews />);
    expect(getByTestId("sign-in-google-button")).toBeTruthy();
  });

  it("renders the error state with retry button and calls onRetry", () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <AuthSignInGmailOauthViews screenState="error" onRetry={onRetry} />,
    );
    expect(getByTestId("auth-signIn-error-state")).toBeTruthy();
    expect(getByTestId("auth-signIn-error-heading")).toBeTruthy();
    fireEvent.press(getByTestId("auth-signIn-error-retry"));
    expect(onRetry).toHaveBeenCalled();
  });
});
