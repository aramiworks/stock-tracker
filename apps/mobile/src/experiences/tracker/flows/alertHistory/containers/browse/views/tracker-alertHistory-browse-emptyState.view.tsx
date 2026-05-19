import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

/**
 * Alert-history empty state — Figma 623:1150.
 *
 * Vertical stack:
 *   - title  17pt Semi Bold #1a1a1a, centered
 *   - body   14pt Regular #808080, centered
 *
 * Unlike the watchlist empty state there's no CTA — the alert history feed is
 * driven by upstream restock detections, not a user action. Users add items
 * via the watchlist tab.
 */
export const TrackerAlertHistoryBrowseEmptyStateView = memo(() => {
  const { t } = useTranslation("tracker");
  return (
    <View style={styles.container} testID="alert-history-empty-state">
      <Text style={styles.title}>{t("alertHistory.empty.title")}</Text>
      <Text style={styles.body}>{t("alertHistory.empty.body")}</Text>
    </View>
  );
});

TrackerAlertHistoryBrowseEmptyStateView.displayName =
  "TrackerAlertHistoryBrowseEmptyStateView";

const styles = StyleSheet.create({
  container: {
    paddingTop: 160,
    paddingBottom: 64,
    alignItems: "center",
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 17,
    color: "#1a1a1a",
    textAlign: "center",
  },
  body: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    color: "#808080",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
