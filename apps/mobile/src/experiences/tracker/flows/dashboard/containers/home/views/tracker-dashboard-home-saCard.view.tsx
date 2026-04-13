import { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

type SaCardState = "eligible" | "notEligible" | "noPurchases";

type TrackerDashboardHomeSaCardViewProps = {
  id?: string;
  state?: SaCardState;
  name?: string;
  initial?: string;
  boutique?: string;
  totalSpend?: number;
  onPress?: () => void;
};

export const TrackerDashboardHomeSaCardView = memo(
  ({
    id,
    state = "eligible",
    name = "김서연 SA",
    initial = "김",
    boutique = "청담 부티크",
    totalSpend = 8200000,
    onPress,
  }: TrackerDashboardHomeSaCardViewProps) => {
    const { t } = useTranslation("tracker");

    const statusText =
      state === "eligible"
        ? t("dashboard.saCard.statusEligible", { boutique })
        : state === "notEligible"
          ? t("dashboard.saCard.statusNotEligible", { boutique })
          : t("dashboard.saCard.statusNoPurchases", { boutique });

    const statusColor =
      state === "eligible"
        ? "#219654"
        : state === "notEligible"
          ? "#FF2D55"
          : "#999";

    const spendText =
      state === "noPurchases"
        ? t("dashboard.saCard.noPurchases")
        : t("dashboard.saCard.spend", { amount: totalSpend.toLocaleString() });

    return (
      <Pressable
        style={styles.card}
        onPress={onPress}
        testID={id ? `sa-card-${id}` : "sa-card"}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={[styles.status, { color: statusColor }]}>
          {statusText}
        </Text>
        <Text style={styles.spend}>{spendText}</Text>
      </Pressable>
    );
  },
);

TrackerDashboardHomeSaCardView.displayName = "TrackerDashboardHomeSaCardView";

const styles = StyleSheet.create({
  card: {
    width: 236,
    height: 68,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  avatar: {
    position: "absolute",
    left: 16,
    top: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFE8ED",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  avatarText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 16,
    color: "#FF2D55",
    textAlign: "center",
  },
  name: {
    position: "absolute",
    left: 72,
    top: 8,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
    color: "#1A1A1A",
  },
  status: {
    position: "absolute",
    left: 72,
    top: 28,
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 10,
  },
  spend: {
    position: "absolute",
    left: 72,
    top: 46,
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 10,
    color: "#666",
  },
});
