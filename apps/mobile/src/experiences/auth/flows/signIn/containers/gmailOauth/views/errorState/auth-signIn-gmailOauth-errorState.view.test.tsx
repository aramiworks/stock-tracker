import { render, fireEvent } from "@testing-library/react-native";
import { AuthSignInGmailOauthErrorStateView } from "./auth-signIn-gmailOauth-errorState.view";

describe("AuthSignInGmailOauthErrorStateView", () => {
  it("renders heading, subtitle, and retry button", () => {
    const { getByTestId } = render(<AuthSignInGmailOauthErrorStateView />);
    expect(getByTestId("auth-signIn-error-state")).toBeTruthy();
    expect(getByTestId("auth-signIn-error-heading")).toBeTruthy();
    expect(getByTestId("auth-signIn-error-subtitle")).toBeTruthy();
    expect(getByTestId("auth-signIn-error-retry")).toBeTruthy();
  });

  it("calls onRetry when retry button is pressed", () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <AuthSignInGmailOauthErrorStateView onRetry={onRetry} />,
    );
    fireEvent.press(getByTestId("auth-signIn-error-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
