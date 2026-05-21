import { memo, type ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import type { AuthSignInGmailOauthControllersOutput } from "../controllers/auth-signIn-gmailOauth.controllers";
import { AuthSignInGmailOauthHeaderView } from "./auth-signIn-gmailOauth-header.view";
import { AuthSignInGmailOauthSignInButtonView } from "./auth-signIn-gmailOauth-signInButton.view";
import { AuthSignInGmailOauthLoadingStateView } from "./auth-signIn-gmailOauth-loadingState.view";
import { AuthSignInGmailOauthErrorStateView } from "./auth-signIn-gmailOauth-errorState.view";

export type AuthSignInGmailOauthScreenState = "default" | "loading" | "error";

type AuthSignInGmailOauthViewsProps =
  Partial<AuthSignInGmailOauthControllersOutput> & {
    screenState?: AuthSignInGmailOauthScreenState;
    onRetry?: () => void;
  };

export const AuthSignInGmailOauthViews = memo<AuthSignInGmailOauthViewsProps>(
  ({ screenState, signInWithGoogle, isSigningIn = false, onRetry }) => {
    const { t } = useTranslation("auth");
    const state: AuthSignInGmailOauthScreenState =
      screenState ?? (isSigningIn ? "loading" : "default");

    const content: Record<AuthSignInGmailOauthScreenState, ReactNode> = {
      default: (
        <>
          <Text role="title" size="large" testID="auth-signIn-welcome">
            {t("signIn.welcome")}
          </Text>
          <View style={styles.signInButtonWrapper}>
            <AuthSignInGmailOauthSignInButtonView
              onPress={signInWithGoogle}
              disabled={isSigningIn}
            />
          </View>
          <Text
            role="body"
            size="small"
            opacity={0.5}
            textAlign="center"
            testID="auth-signIn-terms"
          >
            {t("signIn.terms")}
          </Text>
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
