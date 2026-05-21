import { memo } from "react";
import { View, StyleSheet } from "react-native";

type Props = {
  /**
   * Number of skeleton placeholders to render. Defaults to 1 — the parent
   * `*.views.tsx` composer stamps multiple instances to fill the viewport.
   */
  count?: number;
};

/**
 * Alert-history loading skeleton — Figma 623:1183.
 *
 * Each row is a 47×N gray bar with a 12px gap, matching the live row's
 * vertical rhythm. By default a single placeholder is rendered; the views
 * composer maps over a fixed array to stamp five.
 */
export const TrackerAlertHistoryBrowseSkeletonCardView = memo(
  ({ count = 1 }: Props) => {
    const items = Array.from({ length: count });
    return (
      <View testID="alert-history-skeleton-card">
        {items.map((_, idx) => (
          <View
            key={`skel-${idx}`}
            style={styles.row}
            testID={`alert-history-skeleton-row-${idx}`}
          />
        ))}
      </View>
    );
  },
);

TrackerAlertHistoryBrowseSkeletonCardView.displayName =
  "TrackerAlertHistoryBrowseSkeletonCardView";

const styles = StyleSheet.create({
  row: {
    height: 47,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
});
