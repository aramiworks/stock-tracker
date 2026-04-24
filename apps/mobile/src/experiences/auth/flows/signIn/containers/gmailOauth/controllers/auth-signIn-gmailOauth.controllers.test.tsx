import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { Text, Pressable, Platform } from "react-native";
import { supabase } from "../../../../../../../lib/supabase";

const mockWebPromptAsync = jest.fn().mockResolvedValue(undefined);
jest.mock("expo-auth-session/providers/google", () => ({
  useIdTokenAuthRequest: jest.fn(() => [
    { nonce: "mock-nonce" },
    null,
    mockWebPromptAsync,
  ]),
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ data: { idToken: "native-token" } }),
  },
  isSuccessResponse: jest.fn(
    (res: { data?: { idToken?: string } }) => !!res?.data?.idToken,
  ),
}));

import {
  AuthSignInGmailOauthControllers,
  useAuthSignInGmailOauthControllers,
} from "./auth-signIn-gmailOauth.controllers";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

interface ConsumerHandle {
  signInWithGoogle: () => void;
}

const Consumer = forwardRef<ConsumerHandle>((_props, ref) => {
  const { signInWithGoogle, isSigningIn } =
    useAuthSignInGmailOauthControllers();
  useImperativeHandle(ref, () => ({ signInWithGoogle }));
  return <Text testID="signing-in">{String(isSigningIn)}</Text>;
});
Consumer.displayName = "Consumer";

describe("AuthSignInGmailOauthControllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.replaceProperty(Platform, "OS", "ios" as typeof Platform.OS);
  });

  it("renders children and provides context", () => {
    const { getByText } = render(
      <AuthSignInGmailOauthControllers>
        <Text>child</Text>
      </AuthSignInGmailOauthControllers>,
    );
    expect(getByText("child")).toBeTruthy();
  });

  it("useAuthSignInGmailOauthControllers throws outside provider", () => {
    const ref = React.createRef<ConsumerHandle>();
    expect(() => {
      render(<Consumer ref={ref} />);
    }).toThrow("useAuthSignInGmailOauthControllers must be used within");
  });

  it("isSigningIn starts as false", () => {
    const ref = React.createRef<ConsumerHandle>();
    const { getByTestId } = render(
      <AuthSignInGmailOauthControllers>
        <Consumer ref={ref} />
      </AuthSignInGmailOauthControllers>,
    );
    expect(getByTestId("signing-in").props.children).toBe("false");
  });

  it("native signInWithGoogle calls GoogleSignin.signIn and supabase.signInWithIdToken", async () => {
    (supabase.auth.signInWithIdToken as jest.Mock).mockResolvedValueOnce({
      error: null,
    });
    const ref = React.createRef<ConsumerHandle>();
    render(
      <AuthSignInGmailOauthControllers>
        <Consumer ref={ref} />
      </AuthSignInGmailOauthControllers>,
    );
    await act(async () => {
      ref.current!.signInWithGoogle();
    });
    expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
    expect(GoogleSignin.signIn).toHaveBeenCalled();
    expect(supabase.auth.signInWithIdToken).toHaveBeenCalledWith({
      provider: "google",
      token: "native-token",
    });
  });

  it("web signInWithGoogle calls webPromptAsync", async () => {
    jest.replaceProperty(Platform, "OS", "web" as typeof Platform.OS);
    const ref = React.createRef<ConsumerHandle>();
    render(
      <AuthSignInGmailOauthControllers>
        <Consumer ref={ref} />
      </AuthSignInGmailOauthControllers>,
    );
    await act(async () => {
      ref.current!.signInWithGoogle();
    });
    expect(mockWebPromptAsync).toHaveBeenCalled();
    expect(GoogleSignin.signIn).not.toHaveBeenCalled();
  });

  it("resets isSigningIn to false after native sign-in completes", async () => {
    (supabase.auth.signInWithIdToken as jest.Mock).mockResolvedValueOnce({
      error: null,
    });
    const ref = React.createRef<ConsumerHandle>();
    const { getByTestId } = render(
      <AuthSignInGmailOauthControllers>
        <Consumer ref={ref} />
      </AuthSignInGmailOauthControllers>,
    );
    await act(async () => {
      ref.current!.signInWithGoogle();
    });
    expect(getByTestId("signing-in").props.children).toBe("false");
  });
});
