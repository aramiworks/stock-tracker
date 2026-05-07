import { memo } from "react";
import { Text, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  DashboardTemplate,
  Divider,
  TopAppBar,
  XStack,
  YStack,
} from "@aramiworks/ui";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Constants from "expo-constants";

interface TrackerAccountHomeViewsProps {
  email?: string;
  createdAt?: string;
  signOut?: () => Promise<void>;
  isSigningOut?: boolean;
  onRetry?: () => void;
  screenState?: "default" | "error";
}

export const TrackerAccountHomeViews = memo(
  ({
    email = "",
    createdAt = "",
    signOut,
    isSigningOut = false,
    onRetry,
    screenState = "default",
  }: TrackerAccountHomeViewsProps) => {
    const { t } = useTranslation("tracker");
    const router = useRouter();

    const formattedDate = createdAt
      ? new Date(createdAt).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

    const version = Constants.expoConfig?.version ?? "0.0.0";

    if (screenState === "error") {
      return (
        <DashboardTemplate
          testID="account-home-screen"
          topBar={
            <TopAppBar
              type="small"
              title={t("account.home.topBar.title", "계정")}
              navigationIcon="arrow-back"
              onNavigationPress={() => router.back()}
              testID="account-home-top-bar"
            />
          }
        >
          <YStack padding={16} gap={24} flex={1} justifyContent="center" alignItems="center">
            <Text style={styles.label}>
              {t("account.home.error.message", "정보를 불러올 수 없습니다")}
            </Text>
            {onRetry && (
              <Button variant="outlined" onPress={onRetry} testID="retry-button">
                {t("account.home.error.retryButton", "다시 시도")}
              </Button>
            )}
          </YStack>
        </DashboardTemplate>
      );
    }

    return (
      <DashboardTemplate
        testID="account-home-screen"
        topBar={
          <TopAppBar
            type="small"
            title={t("account.home.topBar.title", "계정")}
            navigationIcon="arrow-back"
            onNavigationPress={() => router.back()}
            testID="account-home-top-bar"
          />
        }
      >
        <YStack padding={16} gap={24} flex={1}>
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
                <Text style={styles.value}>{email}</Text>
              </XStack>
              <Divider />
              <XStack
                justifyContent="space-between"
                alignItems="center"
                paddingVertical={12}
              >
                <Text style={styles.label}>
                  {t(
                    "account.home.accountInfoCard.signupDateLabel",
                    "가입일",
                  )}
                </Text>
                <Text style={styles.value}>{formattedDate}</Text>
              </XStack>
            </YStack>
          </Card>

          <Button
            variant="filled"
            backgroundColor="$error"
            color="$onError"
            onPress={signOut}
            disabled={isSigningOut}
            testID="sign-out-button"
          >
            {t("account.home.signOutButton.label", "로그아웃")}
          </Button>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText} testID="version-footer">
              {t("account.home.versionFooter.label", "버전")} v{version}
            </Text>
          </View>
        </YStack>
      </DashboardTemplate>
    );
  },
);

TrackerAccountHomeViews.displayName = "TrackerAccountHomeViews";

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
  versionContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  versionText: {
    fontFamily: "Inter",
    fontSize: 12,
    color: "#49454F",
    opacity: 0.6,
  },
});
