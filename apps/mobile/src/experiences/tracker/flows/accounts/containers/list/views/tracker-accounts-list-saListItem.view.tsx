import { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

type SaListItemState = "eligible" | "notEligible" | "noPurchases";

type TrackerAccountsListSaListItemViewProps = {
  id?: string;
  state?: SaListItemState;
  name?: string;
  initial?: string;
  boutique?: string;
  totalSpend?: number;
  onPress?: () => void;
  onLongPress?: () => void;
};

export const TrackerAccountsListSaListItemView = memo(
  ({
    id,
    state = "eligible",
    name = "김서연 SA",
    initial = "김",
    boutique = "청담 부티크",
    totalSpend = 8200000,
    onPress,
    onLongPress,
  }: TrackerAccountsListSaListItemViewProps) => {
    const { t } = useTranslation("tracker");

    const statusText =
      state === "eligible"
        ? t("accounts.list.saListItem.statusEligible", {
            amount: totalSpend.toLocaleString(),
          })
        : state === "notEligible"
          ? t("accounts.list.saListItem.statusNotEligible", {
              amount: totalSpend.toLocaleString(),
            })
          : t("accounts.list.saListItem.statusNoPurchases");

    const statusColor =
      state === "eligible"
        ? "#219654"
        : state === "notEligible"
          ? "#FF2D55"
          : "#999";

    return (
      <Pressable
        style={styles.card}
        onPress={onPress}
        onLongPress={onLongPress}
        testID={id ? `sa-list-item-${id}` : undefined}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.boutique}>{boutique}</Text>
        <Text style={[styles.status, { color: statusColor }]}>
          {statusText}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  },
);

TrackerAccountsListSaListItemView.displayName =
  "TrackerAccountsListSaListItemView";

const styles = StyleSheet.create({
  card: {
    width: 350,
    height: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  avatar: {
    position: "absolute",
    left: 16,
    top: 18,
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
    top: 12,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 15,
    color: "#1A1A1A",
  },
  boutique: {
    position: "absolute",
    left: 72,
    top: 32,
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#888",
  },
  status: {
    position: "absolute",
    left: 72,
    top: 52,
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
  },
  chevron: {
    position: "absolute",
    left: 320,
    top: 24,
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 20,
    color: "#CCC",
  },
});
