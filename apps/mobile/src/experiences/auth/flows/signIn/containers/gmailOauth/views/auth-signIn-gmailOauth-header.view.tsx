import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

const BRAND_RED = "#FF2D55";

export const AuthSignInGmailOauthHeaderView = memo(() => {
  const { t } = useTranslation("auth");
  return (
    <View style={styles.container} testID="auth-signIn-header">
      <View style={styles.iconBadge}>
        <Text style={styles.iconLetter}>S</Text>
      </View>
      <Text style={styles.title} testID="auth-signIn-title">
        {t("signIn.title")}
      </Text>
      <Text style={styles.subtitle} testID="auth-signIn-subtitle">
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
    paddingTop: 96,
    paddingBottom: 48,
  },
  iconBadge: {
    width: 96,
    height: 96,
    borderRadius: 22,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  iconLetter: {
    fontFamily: "Inter",
    fontWeight: "800",
    fontSize: 48,
    lineHeight: 56,
    color: BRAND_RED,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: "white",
    marginTop: 28,
  },
  subtitle: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: "white",
    opacity: 0.7,
    marginTop: 6,
  },
});
