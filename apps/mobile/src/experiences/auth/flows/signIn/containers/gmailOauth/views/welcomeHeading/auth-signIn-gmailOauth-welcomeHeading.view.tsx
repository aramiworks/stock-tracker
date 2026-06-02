import { memo } from "react";
import { Text } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

export const AuthSignInGmailOauthWelcomeHeadingView = memo(() => {
  const { t } = useTranslation("auth");
  return (
    <Text role="title" size="large" testID="auth-signIn-welcome">
      {t("signIn.welcome")}
    </Text>
  );
});

AuthSignInGmailOauthWelcomeHeadingView.displayName =
  "AuthSignInGmailOauthWelcomeHeadingView";
