import { memo } from "react";
import { View, StyleSheet } from "react-native";

/**
 * Detail-screen loading skeleton — Figma 846-138.
 * Hero block + two SKU rows + three history rows.
 */
export const TrackerWatchlistDetailSkeletonCardView = memo(() => {
  return (
    <View style={styles.container} testID="watchlist-detail-skeleton">
      <View style={styles.hero} />
      <View style={styles.section}>
        <View style={styles.row} />
        <View style={styles.row} />
      </View>
      <View style={styles.section}>
        <View style={styles.row} />
        <View style={styles.row} />
        <View style={styles.row} />
      </View>
    </View>
  );
});

TrackerWatchlistDetailSkeletonCardView.displayName =
  "TrackerWatchlistDetailSkeletonCardView";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  hero: {
    height: 72,
    backgroundColor: "#ededed",
    borderRadius: 4,
    marginTop: 16,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    height: 48,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    marginTop: 6,
  },
});
