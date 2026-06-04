import { memo, type ReactNode } from "react";
import { DashboardTemplate, TopAppBar, YStack } from "@aramiworks/ui";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { TrackerAccountHomeAccountInfoCardView } from "./tracker-account-home-accountInfoCard.view";
import { TrackerAccountHomeSignOutButtonView } from "./tracker-account-home-signOutButton.view";
import { TrackerAccountHomeVersionFooterView } from "./tracker-account-home-versionFooter.view";
import { TrackerAccountHomeLoadingStateView } from "./tracker-account-home-loadingState.view";
import { TrackerAccountHomeErrorStateView } from "./tracker-account-home-errorState.view";

export type TrackerAccountHomeScreenState = "default" | "loading" | "error";

interface TrackerAccountHomeViewsProps {
  screenState?: TrackerAccountHomeScreenState;
  email?: string;
  createdAt?: string;
  signOut?: () => Promise<void>;
  isSigningOut?: boolean;
  onRetry?: () => void;
}

export const TrackerAccountHomeViews = memo(
  ({
    screenState = "default",
    email = "",
    createdAt = "",
    signOut,
    isSigningOut = false,
    onRetry,
  }: TrackerAccountHomeViewsProps) => {
    const { t } = useTranslation("tracker");
    const router = useRouter();

    // Top group: cards + sign-out (laid out at the top with consistent gaps)
    // Bottom group: version footer (anchored to bottom via flex spacer)
    const topGroup: Record<TrackerAccountHomeScreenState, ReactNode> = {
      default: (
        <YStack gap={24}>
          <TrackerAccountHomeAccountInfoCardView
            email={email}
            createdAt={createdAt}
          />
          <TrackerAccountHomeSignOutButtonView
            onPress={signOut}
            disabled={isSigningOut}
          />
        </YStack>
      ),
      loading: <TrackerAccountHomeLoadingStateView />,
      error: <TrackerAccountHomeErrorStateView onRetry={onRetry} />,
    };

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
        <YStack padding={16} flex={1} justifyContent="space-between">
          {topGroup[screenState]}
          <TrackerAccountHomeVersionFooterView />
        </YStack>
      </DashboardTemplate>
    );
  },
);

TrackerAccountHomeViews.displayName = "TrackerAccountHomeViews";
