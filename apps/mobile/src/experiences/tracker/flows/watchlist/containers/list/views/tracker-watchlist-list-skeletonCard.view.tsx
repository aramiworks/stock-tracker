import { memo } from "react";
import { View, StyleSheet } from "react-native";

/**
 * Watchlist loading skeleton — Figma 845-86.
 * One group header bar + two row skeletons; rendered three times by the views
 * file to fill the viewport.
 */
export const TrackerWatchlistListSkeletonCardView = memo(() => {
  return (
    <View style={styles.group} testID="watchlist-skeleton-card">
      <View style={styles.header} />
      <View style={styles.row} />
      <View style={styles.row} />
    </View>
  );
});

TrackerWatchlistListSkeletonCardView.displayName =
  "TrackerWatchlistListSkeletonCardView";

const styles = StyleSheet.create({
  group: {
    marginBottom: 12,
  },
  header: {
    height: 48,
    backgroundColor: "#ededed",
    borderRadius: 4,
  },
  row: {
    height: 64,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    marginTop: 6,
  },
});
