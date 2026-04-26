import { memo, useState, type ReactNode } from "react";
import { View, RefreshControl, StyleSheet } from "react-native";
import { Text, FAB, DashboardTemplate } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import type {
  TrackerDashboardHomeScreenState,
  TrackerDashboardHomeControllersOutput,
} from "../models/tracker-dashboard-home.type";
import { TrackerDashboardHomeEligibilityBadgeView } from "./tracker-dashboard-home-eligibilityBadge.view";
import { TrackerDashboardHomeSpendSummaryCardView } from "./tracker-dashboard-home-spendSummaryCard.view";
import { TrackerDashboardHomeSaCardView } from "./tracker-dashboard-home-saCard.view";
import { TrackerDashboardHomeRefreshFabView } from "./tracker-dashboard-home-refreshFab.view";
import { TrackerDashboardHomeEmptyStateView } from "./tracker-dashboard-home-emptyState.view";
import { TrackerDashboardHomeErrorStateView } from "./tracker-dashboard-home-errorState.view";
import { TrackerSkeletonCardView } from "@/experiences/tracker/views";
import { TrackerAccountFormModalView } from "@/experiences/tracker/views/tracker-accountFormModal.view";

type TrackerDashboardHomeViewsProps =
  Partial<TrackerDashboardHomeControllersOutput> & {
    onRefresh?: () => void;
    onRetry?: () => void;
    isRefreshing?: boolean;
  };

export const TrackerDashboardHomeViews = memo(
  ({
    screenState = "default",
    eligibilityStatus = "eligible",
    totalSpend = 12450000,
    goalAmount = 30000000,
    saAccounts = [],
    onSaPress,
    onRefresh,
    onRetry,
    onCreateAccount,
    isRefreshing = false,
  }: TrackerDashboardHomeViewsProps) => {
    const { t } = useTranslation("tracker");
    const [showAccountModal, setShowAccountModal] = useState(false);
    const spendState =
      totalSpend > 0 ? "populated" : ("zero" as "populated" | "zero");

    const content: Record<TrackerDashboardHomeScreenState, ReactNode> = {
      default: (
        <>
          <TrackerDashboardHomeEligibilityBadgeView state={eligibilityStatus} />
          <View style={styles.spacer16} />
          <TrackerDashboardHomeSpendSummaryCardView
            state={spendState}
            totalSpend={totalSpend}
            goalAmount={goalAmount}
          />
          {saAccounts.map((sa, i) => (
            <View key={sa.id}>
              <View style={i === 0 ? styles.spacer16 : styles.spacer12} />
              <TrackerDashboardHomeSaCardView
                id={sa.id}
                state={sa.state}
                name={sa.name}
                initial={sa.initial}
                boutique={sa.boutique}
                totalSpend={sa.totalSpend}
                onPress={() => onSaPress?.(sa.id)}
              />
            </View>
          ))}
        </>
      ),
      empty: (
        <>
          <TrackerDashboardHomeEligibilityBadgeView state="notEligible" />
          <View style={styles.spacer16} />
          <TrackerDashboardHomeEmptyStateView
            onCtaPress={() => setShowAccountModal(true)}
          />
        </>
      ),
      loading: (
        <>
          <TrackerSkeletonCardView width={350} height={36} />
          <View style={styles.spacer16} />
          <TrackerSkeletonCardView width={350} height={100} />
          <View style={styles.spacer16} />
          <TrackerSkeletonCardView width={350} height={68} />
          <View style={styles.spacer12} />
          <TrackerSkeletonCardView width={350} height={68} />
        </>
      ),
      error: <TrackerDashboardHomeErrorStateView onRetry={onRetry} />,
    };

    const showFab = screenState === "default" || screenState === "empty";
    const fab = showFab ? (
      <>
        {screenState === "default" && (
          <>
            <TrackerDashboardHomeRefreshFabView onPress={onRefresh} />
            <View style={styles.fabSpacer} />
          </>
        )}
        <FAB
          icon="add"
          color="primary"
          onPress={() => setShowAccountModal(true)}
          accessibilityLabel={t("dashboard.addAccountFab")}
          testID="add-account-fab"
        />
      </>
    ) : undefined;

    return (
      <>
        <DashboardTemplate
          testID="dashboard-home-screen"
          topBar={
            <>
              <View style={styles.statusBar} />
              <View style={styles.appBar}>
                <Text role="title" size="large" testID="dashboard-home-title">
                  {t("dashboard.title")}
                </Text>
              </View>
            </>
          }
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
          fab={fab}
        >
          {content[screenState ?? /* istanbul ignore next -- default prop always provides a value */ "default"]}
        </DashboardTemplate>
        {onCreateAccount && (
          <TrackerAccountFormModalView
            visible={showAccountModal}
            onClose={() => setShowAccountModal(false)}
            onSubmit={onCreateAccount}
          />
        )}
      </>
    );
  },
);

TrackerDashboardHomeViews.displayName = "TrackerDashboardHomeViews";

const styles = StyleSheet.create({
  statusBar: {
    height: 54,
  },
  appBar: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 64,
  },
  fabSpacer: {
    height: 12,
  },
  spacer16: {
    height: 16,
  },
  spacer12: {
    height: 12,
  },
});
