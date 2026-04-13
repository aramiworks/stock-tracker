import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

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
        <View style={styles.card}>
          <View style={[styles.skeleton, { width: 80, height: 10, top: 14 }]} />
          <View
            style={[styles.skeleton, { width: 150, height: 18, top: 34 }]}
          />
          <View
            style={[styles.skeleton, { width: 120, height: 10, top: 62 }]}
          />
          <View style={[styles.skeleton, { width: 198, height: 5, top: 82 }]} />
        </View>
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
      <View style={styles.card} testID="spend-summary-card">
        <Text style={styles.label}>{t("dashboard.spendSummary.label")}</Text>
        <Text style={styles.amount}>{formattedSpend}</Text>
        <Text style={styles.goal}>{formattedGoal}</Text>
        <Text
          style={[
            styles.percent,
            { color: totalSpend > 0 ? "#FF2D55" : "#999" },
          ]}
        >
          {formattedPercent}
        </Text>
        <View style={styles.progressBg}>
          {progressWidth > 0 && (
            <View style={[styles.progressFill, { width: progressWidth }]} />
          )}
        </View>
      </View>
    );
  },
);

TrackerDashboardHomeSpendSummaryCardView.displayName =
  "TrackerDashboardHomeSpendSummaryCardView";

const styles = StyleSheet.create({
  card: {
    width: 230,
    height: 100,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  label: {
    position: "absolute",
    left: 16,
    top: 12,
    fontFamily: "Inter",
    fontSize: 12,
    color: "#888",
  },
  amount: {
    position: "absolute",
    left: 16,
    top: 32,
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 22,
    color: "#1A1A1A",
  },
  goal: {
    position: "absolute",
    left: 16,
    top: 62,
    fontFamily: "Inter",
    fontSize: 11,
    color: "#888",
  },
  percent: {
    position: "absolute",
    left: 178,
    top: 62,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 11,
  },
  progressBg: {
    position: "absolute",
    left: 16,
    top: 82,
    width: 198,
    height: 5,
    backgroundColor: "#E8E8E8",
    borderRadius: 3,
  },
  progressFill: {
    height: 5,
    backgroundColor: "#FF2D55",
    borderRadius: 3,
  },
  skeleton: {
    position: "absolute",
    left: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
});
