import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

type TrackerAccountsDetailSaHeaderViewProps = {
  name?: string;
  initial?: string;
  boutique?: string;
  totalSpend?: number;
  testID?: string;
};

export const TrackerAccountsDetailSaHeaderView = memo(
  ({
    name = "김서연 SA",
    initial = "김",
    boutique = "청담 부티크",
    totalSpend = 8200000,
    testID,
  }: TrackerAccountsDetailSaHeaderViewProps) => {
    return (
      <View style={styles.card} testID={testID}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>
          {boutique} · ₩{totalSpend.toLocaleString()}
        </Text>
      </View>
    );
  },
);

TrackerAccountsDetailSaHeaderView.displayName =
  "TrackerAccountsDetailSaHeaderView";

const styles = StyleSheet.create({
  card: {
    width: 240,
    height: 64,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  avatar: {
    position: "absolute",
    left: 12,
    top: 10,
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
    left: 68,
    top: 12,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#FFFFFF",
  },
  subtitle: {
    position: "absolute",
    left: 68,
    top: 34,
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 11,
    color: "#BBB",
  },
});
