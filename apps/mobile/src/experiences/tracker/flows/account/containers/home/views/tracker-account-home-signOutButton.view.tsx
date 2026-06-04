import { memo } from "react";
import { Button } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

type Props = {
  onPress?: () => void;
  disabled?: boolean;
};

export const TrackerAccountHomeSignOutButtonView = memo<Props>(
  ({ onPress, disabled = false }) => {
    const { t } = useTranslation("tracker");
    return (
      <Button
        variant="outlined"
        borderColor="$error"
        color="$error"
        onPress={onPress}
        disabled={disabled}
        testID="sign-out-button"
      >
        {t("account.home.signOutButton.label", "로그아웃")}
      </Button>
    );
  },
);

TrackerAccountHomeSignOutButtonView.displayName =
  "TrackerAccountHomeSignOutButtonView";
