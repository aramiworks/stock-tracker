import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Card, XStack, YStack } from "@aramiworks/ui";

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
      <Card
        variant="elevated"
        onPress={onPress}
        onLongPress={onLongPress}
        testID={
          /* istanbul ignore next */ id ? `sa-list-item-${id}` : undefined
        }
      >
        <XStack gap={12} alignItems="center">
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <YStack flex={1} gap={2}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.boutique}>{boutique}</Text>
            <Text style={[styles.status, { color: statusColor }]}>
              {statusText}
            </Text>
          </YStack>
          <Text style={styles.chevron}>›</Text>
        </XStack>
      </Card>
    );
  },
);

TrackerAccountsListSaListItemView.displayName =
  "TrackerAccountsListSaListItemView";

const styles = StyleSheet.create({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFE8ED",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 16,
    color: "#FF2D55",
    textAlign: "center",
  },
  name: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 15,
    color: "#1A1A1A",
  },
  boutique: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#888",
  },
  status: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
  },
  chevron: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 20,
    color: "#CCC",
  },
});
