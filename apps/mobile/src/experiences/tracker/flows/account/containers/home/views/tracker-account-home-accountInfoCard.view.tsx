import { memo } from "react";
import { Text, StyleSheet } from "react-native";
import { Card, Divider, XStack, YStack } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

type Props = {
  email?: string;
  createdAt?: string;
};

export const TrackerAccountHomeAccountInfoCardView = memo<Props>(
  ({ email = "", createdAt = "" }) => {
    const { t } = useTranslation("tracker");
    const formattedDate = createdAt
      ? new Date(createdAt).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

    return (
      <Card variant="outlined" testID="account-info-card">
        <YStack padding={16} gap={0}>
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingVertical={12}
          >
            <Text style={styles.label}>
              {t("account.home.accountInfoCard.emailLabel", "이메일")}
            </Text>
            <Text style={styles.value} testID="account-email">
              {email}
            </Text>
          </XStack>
          <Divider />
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingVertical={12}
          >
            <Text style={styles.label}>
              {t("account.home.accountInfoCard.signupDateLabel", "가입일")}
            </Text>
            <Text style={styles.value} testID="account-signup-date">
              {formattedDate}
            </Text>
          </XStack>
        </YStack>
      </Card>
    );
  },
);

TrackerAccountHomeAccountInfoCardView.displayName =
  "TrackerAccountHomeAccountInfoCardView";

const styles = StyleSheet.create({
  label: {
    fontFamily: "Inter",
    fontSize: 14,
    color: "#49454F",
  },
  value: {
    fontFamily: "Inter",
    fontSize: 14,
    color: "#1C1B1F",
  },
});
