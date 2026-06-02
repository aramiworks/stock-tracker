import { render } from "@testing-library/react-native";
import { AuthSignInGmailOauthLoadingStateView } from "./auth-signIn-gmailOauth-loadingState.view";

describe("AuthSignInGmailOauthLoadingStateView", () => {
  it("renders the progress indicator and caption", () => {
    const { getByTestId } = render(<AuthSignInGmailOauthLoadingStateView />);
    expect(getByTestId("auth-signIn-loading-state")).toBeTruthy();
    expect(getByTestId("progress-indicator")).toBeTruthy();
    expect(getByTestId("auth-signIn-loading-caption")).toBeTruthy();
  });
});
