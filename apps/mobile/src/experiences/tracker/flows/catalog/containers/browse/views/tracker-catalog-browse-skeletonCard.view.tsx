import { memo } from "react";
import { View, StyleSheet } from "react-native";

export const TrackerCatalogBrowseSkeletonCardView = memo(() => {
  return (
    <View style={styles.group} testID="catalog-skeleton-card">
      <View style={styles.header} />
      <View style={styles.row} />
      <View style={styles.row} />
    </View>
  );
});

TrackerCatalogBrowseSkeletonCardView.displayName =
  "TrackerCatalogBrowseSkeletonCardView";

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
    height: 56,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    marginTop: 6,
    marginLeft: 56,
  },
});
