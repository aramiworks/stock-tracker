import { memo } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

const BRAND_RED = "#FF2D55";

export const AuthSignInGmailOauthHeaderView = memo(() => {
  const { t } = useTranslation("auth");
  return (
    <View style={styles.container} testID="auth-signIn-header">
      <View style={styles.iconBadge}>
        <Text role="display" size="small" color={BRAND_RED}>
          S
        </Text>
      </View>
      <Text
        role="display"
        size="small"
        color="white"
        marginTop={12}
        testID="auth-signIn-title"
      >
        {t("signIn.title")}
      </Text>
      <Text
        role="body"
        size="large"
        color="white"
        opacity={0.75}
        marginTop={8}
        testID="auth-signIn-subtitle"
      >
        {t("signIn.subtitle")}
      </Text>
    </View>
  );
});

AuthSignInGmailOauthHeaderView.displayName = "AuthSignInGmailOauthHeaderView";

const styles = StyleSheet.create({
  container: {
    height: 400,
    backgroundColor: BRAND_RED,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingBottom: 48,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
});
