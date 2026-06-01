import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

/**
 * Empty state for the history section — Figma 846-114.
 *
 * Bell glyph (Unicode 🔔 stand-in until a real SVG ships) above the empty title
 * and body strings. Lives inside the detail screen below the SKU section.
 */
export const TrackerWatchlistDetailHistoryEmptyView = memo(() => {
  const { t } = useTranslation("tracker");
  return (
    <View style={styles.container} testID="watchlist-detail-history-empty">
      <Text style={styles.icon}>🔔</Text>
      <Text style={styles.title}>
        {t("watchlist.detail.history.empty.title")}
      </Text>
      <Text style={styles.body}>
        {t("watchlist.detail.history.empty.body")}
      </Text>
    </View>
  );
});

TrackerWatchlistDetailHistoryEmptyView.displayName =
  "TrackerWatchlistDetailHistoryEmptyView";

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    alignItems: "center",
  },
  icon: {
    fontSize: 32,
    color: "#c5c5c5",
    marginBottom: 12,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 15,
    color: "#1a1a1a",
  },
  body: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 13,
    color: "#808080",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
