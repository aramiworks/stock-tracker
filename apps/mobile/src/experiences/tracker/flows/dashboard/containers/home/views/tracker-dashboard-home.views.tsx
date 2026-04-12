import { memo, useState, type ReactNode } from "react";
import { View, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { Text, FAB } from "@aramiworks/ui";
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
          <TrackerDashboardHomeEmptyStateView />
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
      error: <TrackerDashboardHomeErrorStateView />,
    };

    return (
      <View style={styles.screen} testID="dashboard-home-screen">
        <View style={styles.statusBar} />
        <View style={styles.appBar}>
          <Text role="title" size="large" testID="dashboard-home-title">
            {t("dashboard.title")}
          </Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          {content[screenState ?? "default"]}
        </ScrollView>
        {(screenState === "default" || screenState === "empty") && (
          <View style={styles.fabContainer}>
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
          </View>
        )}
        {onCreateAccount && (
          <TrackerAccountFormModalView
            visible={showAccountModal}
            onClose={() => setShowAccountModal(false)}
            onSubmit={onCreateAccount}
          />
        )}
      </View>
    );
  },
);

TrackerDashboardHomeViews.displayName = "TrackerDashboardHomeViews";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  statusBar: {
    height: 54,
  },
  appBar: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  fabContainer: {
    position: "absolute",
    bottom: 96,
    right: 20,
    alignItems: "center",
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
