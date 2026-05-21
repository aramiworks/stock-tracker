import { memo } from "react";
import { Button } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

type AuthSignInGmailOauthSignInButtonViewProps = {
  onPress?: () => void;
  disabled?: boolean;
};

export const AuthSignInGmailOauthSignInButtonView =
  memo<AuthSignInGmailOauthSignInButtonViewProps>(({ onPress, disabled }) => {
    const { t } = useTranslation("auth");
    return (
      <Button
        variant="elevated"
        onPress={onPress}
        disabled={disabled}
        width="100%"
        color="$primary"
        testID="sign-in-google-button"
      >
        {t("signIn.googleButton")}
      </Button>
    );
  });

AuthSignInGmailOauthSignInButtonView.displayName =
  "AuthSignInGmailOauthSignInButtonView";
