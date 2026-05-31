import { memo, type ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import type { AuthSignInGmailOauthControllersOutput } from "../controllers/auth-signIn-gmailOauth.controllers";
import { AuthSignInGmailOauthHeaderView } from "./auth-signIn-gmailOauth-header.view";
import { AuthSignInGmailOauthWelcomeHeadingView } from "./auth-signIn-gmailOauth-welcomeHeading.view";
import { AuthSignInGmailOauthSignInButtonView } from "./auth-signIn-gmailOauth-signInButton.view";
import { AuthSignInGmailOauthTermsView } from "./auth-signIn-gmailOauth-terms.view";
import { AuthSignInGmailOauthLoadingStateView } from "./auth-signIn-gmailOauth-loadingState.view";
import { AuthSignInGmailOauthErrorStateView } from "./auth-signIn-gmailOauth-errorState.view";

export type AuthSignInGmailOauthScreenState = "default" | "loading" | "error";

type AuthSignInGmailOauthViewsProps =
  Partial<AuthSignInGmailOauthControllersOutput> & {
    screenState?: AuthSignInGmailOauthScreenState;
    onRetry?: () => void;
  };

export const AuthSignInGmailOauthViews = memo<AuthSignInGmailOauthViewsProps>(
  ({
    screenState,
    signInWithGoogle,
    isSigningIn = false,
    signInError = false,
    onRetry,
  }) => {
    const state: AuthSignInGmailOauthScreenState =
      screenState ??
      (signInError ? "error" : isSigningIn ? "loading" : "default");

    const content: Record<AuthSignInGmailOauthScreenState, ReactNode> = {
      default: (
        <>
          <AuthSignInGmailOauthWelcomeHeadingView />
          <View style={styles.signInButtonWrapper}>
            <AuthSignInGmailOauthSignInButtonView
              onPress={signInWithGoogle}
              disabled={isSigningIn}
            />
          </View>
          <AuthSignInGmailOauthTermsView />
        </>
      ),
      loading: <AuthSignInGmailOauthLoadingStateView />,
      error: <AuthSignInGmailOauthErrorStateView onRetry={onRetry} />,
    };

    return (
      <View style={styles.screen} testID="auth-signIn-gmailOauth-screen">
        <AuthSignInGmailOauthHeaderView />
        <View style={styles.card}>{content[state]}</View>
      </View>
    );
  },
);

AuthSignInGmailOauthViews.displayName = "AuthSignInGmailOauthViews";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FF2D55",
  },
  card: {
    flex: 1,
    backgroundColor: "white",
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  signInButtonWrapper: {
    width: "100%",
  },
});
