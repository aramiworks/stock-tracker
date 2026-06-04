import { render } from "@testing-library/react-native";
import { AuthSignInGmailOauthHeaderView } from "./auth-signIn-gmailOauth-header.view";

describe("AuthSignInGmailOauthHeaderView", () => {
  it("renders title and subtitle from i18n", () => {
    const { getByTestId } = render(<AuthSignInGmailOauthHeaderView />);
    expect(getByTestId("auth-signIn-header")).toBeTruthy();
    expect(getByTestId("auth-signIn-title")).toBeTruthy();
    expect(getByTestId("auth-signIn-subtitle")).toBeTruthy();
  });
});
