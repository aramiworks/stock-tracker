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
 * Each row card mirrors the loaded-row card hand-off:
 *   card       @ 84h, bg #fafafa, radius 14, 12px gap between rows
 *   avatar     @ 44×44 circle (#e0e0e0), left:14, top:20
 *   bar 1      @ 12×100, #e0e0e0, radius 6, left:70, top:20  (modelName)
 *   bar 2      @ 10×80,  #e0e0e0, radius 6, left:70, top:38  (kind label)
 *   bar 3      @ 10×120, #e0e0e0, radius 6, left:70, top:54  (meta line)
 *
 * By default a single placeholder is rendered; the views composer stamps five
 * to fill the viewport.
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
          >
            <View style={styles.avatar} />
            <View style={[styles.bar, styles.bar1]} />
            <View style={[styles.bar, styles.bar2]} />
            <View style={[styles.bar, styles.bar3]} />
          </View>
        ))}
      </View>
    );
  },
);

TrackerAlertHistoryBrowseSkeletonCardView.displayName =
  "TrackerAlertHistoryBrowseSkeletonCardView";

const styles = StyleSheet.create({
  row: {
    position: "relative",
    height: 84,
    marginBottom: 12,
    backgroundColor: "#fafafa",
    borderRadius: 14,
    overflow: "hidden",
  },
  avatar: {
    position: "absolute",
    left: 14,
    top: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0e0e0",
  },
  bar: {
    position: "absolute",
    left: 70,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
  },
  bar1: {
    top: 20,
    width: 100,
    height: 12,
  },
  bar2: {
    top: 38,
    width: 80,
    height: 10,
  },
  bar3: {
    top: 54,
    width: 120,
    height: 10,
  },
});
