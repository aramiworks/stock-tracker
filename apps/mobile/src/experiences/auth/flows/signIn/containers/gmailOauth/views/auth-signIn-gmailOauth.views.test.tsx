const mockSignInWithGoogle = jest.fn();
let mockIsSigningIn = false;

jest.mock("../controllers/auth-signIn-gmailOauth.controllers", () => ({
  useAuthSignInGmailOauthControllers: () => ({
    signInWithGoogle: mockSignInWithGoogle,
    get isSigningIn() {
      return mockIsSigningIn;
    },
  }),
}));

import { render, fireEvent } from "@testing-library/react-native";
import { AuthSignInGmailOauthViews } from "./auth-signIn-gmailOauth.views";

describe("AuthSignInGmailOauthViews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsSigningIn = false;
  });

  it("renders sign-in screen with title and button", () => {
    const { getByTestId } = render(<AuthSignInGmailOauthViews />);
    expect(getByTestId("auth-signIn-gmailOauth-screen")).toBeTruthy();
    expect(getByTestId("auth-signIn-title")).toBeTruthy();
    expect(getByTestId("auth-signIn-subtitle")).toBeTruthy();
    expect(getByTestId("sign-in-google-button")).toBeTruthy();
  });

  it("calls signInWithGoogle on button press", () => {
    const { getByTestId } = render(<AuthSignInGmailOauthViews />);
    fireEvent.press(getByTestId("sign-in-google-button"));
    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it("shows progress indicator when signing in", () => {
    mockIsSigningIn = true;
    const { getByTestId, queryByTestId } = render(
      <AuthSignInGmailOauthViews />,
    );
    expect(getByTestId("progress-indicator")).toBeTruthy();
    expect(queryByTestId("sign-in-google-button")).toBeNull();
  });
});
