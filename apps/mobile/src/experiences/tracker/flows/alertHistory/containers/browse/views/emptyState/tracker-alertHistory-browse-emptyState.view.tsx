import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

/**
 * Alert-history empty state — Figma 623:1150.
 *
 *   card                @ flex:1, bg #fafafa, radius 12 (fills the area
 *                         between TopAppBar and BottomAppBar)
 *   clipboard icon      @ 32×42 stack (body 32×38 #e8e8e8 r4 + top 20×8 #ccc r3,
 *                         top overlaps body by 4px), centered, marginTop 49
 *   title               @ Inter SemiBold 17 / #1a1a1a, centered, marginTop 20
 *   body                @ Inter Regular 13 / #999, centered, marginTop 6
 *
 * Unlike the watchlist empty state there's no CTA — the alert history feed is
 * driven by upstream restock detections, not a user action. Users add items
 * via the watchlist tab.
 */
export const TrackerAlertHistoryBrowseEmptyStateView = memo(() => {
  const { t } = useTranslation("tracker");
  return (
    <View style={styles.card} testID="alert-history-empty-state">
      <View style={styles.iconWrapper} testID="alert-history-empty-icon">
        <View style={styles.clipboardTop} />
        <View style={styles.clipboardBody} />
      </View>
      <Text style={styles.title}>{t("alertHistory.empty.title")}</Text>
      <Text style={styles.body}>{t("alertHistory.empty.body")}</Text>
    </View>
  );
});

TrackerAlertHistoryBrowseEmptyStateView.displayName =
  "TrackerAlertHistoryBrowseEmptyStateView";

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    alignItems: "center",
    paddingTop: 49,
    paddingHorizontal: 24,
  },
  iconWrapper: {
    width: 32,
    height: 42,
    position: "relative",
  },
  clipboardTop: {
    position: "absolute",
    top: 0,
    left: 6,
    width: 20,
    height: 8,
    backgroundColor: "#cccccc",
    borderRadius: 3,
  },
  clipboardBody: {
    position: "absolute",
    top: 4,
    left: 0,
    width: 32,
    height: 38,
    backgroundColor: "#e8e8e8",
    borderRadius: 4,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 17,
    color: "#1a1a1a",
    textAlign: "center",
    marginTop: 20,
  },
  body: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 13,
    color: "#999999",
    textAlign: "center",
    marginTop: 6,
  },
});
