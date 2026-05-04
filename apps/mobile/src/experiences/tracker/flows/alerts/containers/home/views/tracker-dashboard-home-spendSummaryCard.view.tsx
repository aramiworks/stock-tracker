import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Card, XStack, YStack } from "@aramiworks/ui";

type SpendSummaryCardState = "populated" | "zero" | "loading";

type TrackerDashboardHomeSpendSummaryCardViewProps = {
  state?: SpendSummaryCardState;
  totalSpend?: number;
  goalAmount?: number;
};

export const TrackerDashboardHomeSpendSummaryCardView = memo(
  ({
    state = "populated",
    totalSpend = 12450000,
    goalAmount = 30000000,
  }: TrackerDashboardHomeSpendSummaryCardViewProps) => {
    const { t } = useTranslation("tracker");
    if (state === "loading") {
      return (
        <Card variant="elevated">
          <YStack gap={8}>
            <View style={[styles.skeleton, { width: 80, height: 10 }]} />
            <View style={[styles.skeleton, { width: 150, height: 18 }]} />
            <View style={[styles.skeleton, { width: 120, height: 10 }]} />
            <View style={[styles.skeleton, { width: 198, height: 5 }]} />
          </YStack>
        </Card>
      );
    }

    const percentage =
      goalAmount > 0 ? Math.round((totalSpend / goalAmount) * 1000) / 10 : 0;
    const progressWidth =
      goalAmount > 0 ? Math.min((totalSpend / goalAmount) * 198, 198) : 0;

    const formattedSpend = `₩${totalSpend.toLocaleString()}`;
    const formattedGoal = t("dashboard.spendSummary.goal", {
      amount: goalAmount.toLocaleString(),
    });
    const formattedPercent = `${percentage}%`;

    return (
      <Card variant="elevated" testID="spend-summary-card">
        <YStack gap={4}>
          <Text style={styles.label}>{t("dashboard.spendSummary.label")}</Text>
          <Text style={styles.amount}>{formattedSpend}</Text>
          <XStack alignItems="center" justifyContent="space-between">
            <Text style={styles.goal}>{formattedGoal}</Text>
            <Text
              style={[
                styles.percent,
                { color: totalSpend > 0 ? "#FF2D55" : "#999" },
              ]}
            >
              {formattedPercent}
            </Text>
          </XStack>
          <View style={styles.progressBg}>
            {progressWidth > 0 && (
              <View style={[styles.progressFill, { width: progressWidth }]} />
            )}
          </View>
        </YStack>
      </Card>
    );
  },
);

TrackerDashboardHomeSpendSummaryCardView.displayName =
  "TrackerDashboardHomeSpendSummaryCardView";

const styles = StyleSheet.create({
  label: {
    fontFamily: "Inter",
    fontSize: 12,
    color: "#888",
  },
  amount: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 22,
    color: "#1A1A1A",
  },
  goal: {
    fontFamily: "Inter",
    fontSize: 11,
    color: "#888",
  },
  percent: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 11,
  },
  progressBg: {
    width: 198,
    height: 5,
    backgroundColor: "#E8E8E8",
    borderRadius: 3,
    marginTop: 4,
  },
  progressFill: {
    height: 5,
    backgroundColor: "#FF2D55",
    borderRadius: 3,
  },
  skeleton: {
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
});
