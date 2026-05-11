import { memo } from "react";
import { View, StyleSheet } from "react-native";
import { ProgressIndicator, Text } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

export const AuthSignInGmailOauthLoadingStateView = memo(() => {
  const { t } = useTranslation("auth");
  return (
    <View style={styles.container} testID="auth-signIn-loading-state">
      <ProgressIndicator type="circular" size={32} />
      <Text
        role="body"
        size="medium"
        color="white"
        opacity={0.8}
        marginTop={12}
        testID="auth-signIn-loading-caption"
      >
        {t("signIn.loadingCaption")}
      </Text>
    </View>
  );
});

AuthSignInGmailOauthLoadingStateView.displayName =
  "AuthSignInGmailOauthLoadingStateView";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});
