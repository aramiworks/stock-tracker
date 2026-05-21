import { memo } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

type AuthSignInGmailOauthErrorStateViewProps = {
  onRetry?: () => void;
};

export const AuthSignInGmailOauthErrorStateView =
  memo<AuthSignInGmailOauthErrorStateViewProps>(({ onRetry }) => {
    const { t } = useTranslation("auth");
    return (
      <View style={styles.container} testID="auth-signIn-error-state">
        <Text
          role="title"
          size="large"
          textAlign="center"
          testID="auth-signIn-error-heading"
        >
          {t("signIn.errorHeading")}
        </Text>
        <Text
          role="body"
          size="medium"
          opacity={0.7}
          textAlign="center"
          marginTop={8}
          testID="auth-signIn-error-subtitle"
        >
          {t("signIn.errorSubtitle")}
        </Text>
        <Button
          variant="filled"
          onPress={onRetry}
          backgroundColor="#FF2D55"
          color="white"
          marginTop={24}
          testID="auth-signIn-error-retry"
        >
          {t("signIn.errorRetryButton")}
        </Button>
      </View>
    );
  });

AuthSignInGmailOauthErrorStateView.displayName =
  "AuthSignInGmailOauthErrorStateView";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});
