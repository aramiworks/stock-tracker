import { render, fireEvent } from "@testing-library/react-native";
import { AuthSignInGmailOauthSignInButtonView } from "./auth-signIn-gmailOauth-signInButton.view";

describe("AuthSignInGmailOauthSignInButtonView", () => {
  it("renders the sign-in button", () => {
    const { getByTestId } = render(<AuthSignInGmailOauthSignInButtonView />);
    expect(getByTestId("sign-in-google-button")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <AuthSignInGmailOauthSignInButtonView onPress={onPress} />,
    );
    fireEvent.press(getByTestId("sign-in-google-button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
