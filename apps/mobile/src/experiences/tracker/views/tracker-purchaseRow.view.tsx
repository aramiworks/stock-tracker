import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

type PurchaseRowType = "regular" | "tank";

type TrackerPurchaseRowViewProps = {
  type?: PurchaseRowType;
  productName?: string;
  date?: string;
  amount?: number;
  testID?: string;
};

export const TrackerPurchaseRowView = memo(
  ({
    type = "regular",
    productName = "트리니티 링",
    date = "2024.03.15",
    amount = 3200000,
    testID,
  }: TrackerPurchaseRowViewProps) => {
    const formattedAmount = `+₩${amount.toLocaleString()}`;

    return (
      <View style={styles.container} testID={testID}>
        {type === "tank" && <View style={styles.tankIndicator} />}
        <View style={[styles.textGroup, type === "tank" && { marginLeft: 16 }]}>
          <Text style={styles.productName}>{productName}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <Text style={styles.amount}>{formattedAmount}</Text>
      </View>
    );
  },
);

TrackerPurchaseRowView.displayName = "TrackerPurchaseRowView";

const styles = StyleSheet.create({
  container: {
    width: 220,
    height: 56,
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
    overflow: "hidden",
  },
  tankIndicator: {
    position: "absolute",
    left: 0,
    top: 4,
    width: 4,
    height: 44,
    backgroundColor: "#009E99",
    borderRadius: 2,
  },
  textGroup: {
    flex: 1,
  },
  productName: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    color: "#1A1A1A",
  },
  date: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  amount: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#1A1A1A",
  },
});
