import { memo } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import { useAuthSignInGmailOauthControllers } from "../controllers/auth-signIn-gmailOauth.controllers";
import { AuthSignInGmailOauthSignInButtonView } from "./auth-signIn-gmailOauth-signInButton.view";
import { AuthSignInGmailOauthLoadingStateView } from "./auth-signIn-gmailOauth-loadingState.view";

export const AuthSignInGmailOauthViews = memo(() => {
  const { signInWithGoogle, isSigningIn } =
    useAuthSignInGmailOauthControllers();
  const { t } = useTranslation("auth");

  return (
    <View style={styles.container} testID="auth-signIn-gmailOauth-screen">
      <Text
        role="display"
        size="small"
        color="white"
        testID="auth-signIn-title"
      >
        {t("signIn.title")}
      </Text>
      <Text
        role="body"
        size="large"
        color="white"
        opacity={0.8}
        marginTop={8}
        testID="auth-signIn-subtitle"
      >
        {t("signIn.subtitle")}
      </Text>
      <View style={styles.buttonWrapper}>
        {isSigningIn ? (
          <AuthSignInGmailOauthLoadingStateView />
        ) : (
          <AuthSignInGmailOauthSignInButtonView
            onPress={signInWithGoogle}
            disabled={isSigningIn}
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF2D55",
  },
  buttonWrapper: {
    marginTop: 32,
    alignItems: "center",
  },
});

AuthSignInGmailOauthViews.displayName = "AuthSignInGmailOauthViews";
