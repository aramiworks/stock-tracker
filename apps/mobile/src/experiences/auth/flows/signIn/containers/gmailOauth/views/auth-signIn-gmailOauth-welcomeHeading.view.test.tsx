import { render } from "@testing-library/react-native";
import { AuthSignInGmailOauthWelcomeHeadingView } from "./auth-signIn-gmailOauth-welcomeHeading.view";

describe("AuthSignInGmailOauthWelcomeHeadingView", () => {
  it("renders the welcome heading from i18n", () => {
    const { getByTestId } = render(<AuthSignInGmailOauthWelcomeHeadingView />);
    expect(getByTestId("auth-signIn-welcome")).toBeTruthy();
  });
});
