import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  brand: string;
  productLine: string;
  modelName: string;
};

/**
 * Detail hero — Figma 846-2 / 846-57.
 *
 * Top: brand · product line eyebrow @ 12pt Regular #808080
 * Bottom: model name @ 22pt Semi Bold #1a1a1a
 */
export const TrackerWatchlistDetailHeroView = memo(
  ({ brand, productLine, modelName }: Props) => {
    return (
      <View style={styles.container} testID="watchlist-detail-hero">
        <Text style={styles.eyebrow}>
          {brand} · {productLine}
        </Text>
        <Text style={styles.name}>{modelName}</Text>
      </View>
    );
  },
);

TrackerWatchlistDetailHeroView.displayName = "TrackerWatchlistDetailHeroView";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  eyebrow: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#808080",
  },
  name: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 22,
    color: "#1a1a1a",
    marginTop: 4,
  },
});
