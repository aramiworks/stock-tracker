import { memo } from "react";
import { Text } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

export const AuthSignInGmailOauthTermsView = memo(() => {
  const { t } = useTranslation("auth");
  return (
    <Text
      role="body"
      size="small"
      opacity={0.5}
      textAlign="center"
      testID="auth-signIn-terms"
    >
      {t("signIn.terms")}
    </Text>
  );
});

AuthSignInGmailOauthTermsView.displayName = "AuthSignInGmailOauthTermsView";
