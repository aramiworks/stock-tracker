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
          color="white"
          textAlign="center"
          testID="auth-signIn-error-heading"
        >
          {t("signIn.errorHeading")}
        </Text>
        <Text
          role="body"
          size="medium"
          color="white"
          opacity={0.8}
          textAlign="center"
          marginTop={8}
          testID="auth-signIn-error-subtitle"
        >
          {t("signIn.errorSubtitle")}
        </Text>
        <Button
          variant="elevated"
          onPress={onRetry}
          minWidth={200}
          color="$primary"
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
