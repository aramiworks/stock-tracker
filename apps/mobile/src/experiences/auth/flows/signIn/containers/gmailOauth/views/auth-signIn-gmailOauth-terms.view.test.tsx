import { render } from "@testing-library/react-native";
import { AuthSignInGmailOauthTermsView } from "./auth-signIn-gmailOauth-terms.view";

describe("AuthSignInGmailOauthTermsView", () => {
  it("renders the terms text from i18n", () => {
    const { getByTestId } = render(<AuthSignInGmailOauthTermsView />);
    expect(getByTestId("auth-signIn-terms")).toBeTruthy();
  });
});
