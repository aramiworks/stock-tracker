import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  brand: string;
  productLine: string;
};

/**
 * Watchlist group header row — 358×48.
 * Product-line title left (15pt Semi Bold), brand label right (12pt Regular #999).
 * Matches Figma 845-2 (default list) and 845-86 (loading).
 */
export const TrackerWatchlistListGroupHeaderView = memo(
  ({ brand, productLine }: Props) => {
    const testID = `watchlist-group-${brand}-${productLine}`;
    return (
      <View style={styles.row} testID={testID}>
        <Text style={styles.title}>{productLine}</Text>
        <Text style={styles.brand}>{brand}</Text>
      </View>
    );
  },
);

TrackerWatchlistListGroupHeaderView.displayName =
  "TrackerWatchlistListGroupHeaderView";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 15,
    color: "#1a1a1a",
  },
  brand: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#999999",
  },
});
