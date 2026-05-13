import { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  onAddPress?: () => void;
};

/**
 * Watchlist empty state — mirrors Figma 845-69.
 *
 * Vertical stack: title 16pt Semi Bold, body 14pt #808080, "+ 추가" CTA below.
 * Tapping the CTA dispatches to the Shengsho catalog browse screen (the same
 * destination the top-app-bar "+ 추가" action reaches).
 */
export const TrackerWatchlistListEmptyStateView = memo(({ onAddPress }: Props) => {
  const { t } = useTranslation("tracker");
  return (
    <View style={styles.container} testID="watchlist-empty-state">
      <Text style={styles.title}>{t("watchlist.empty.title")}</Text>
      <Text style={styles.body}>{t("watchlist.empty.body")}</Text>
      {onAddPress && (
        <Pressable
          onPress={onAddPress}
          accessibilityRole="button"
          accessibilityLabel={t("watchlist.empty.cta")}
          testID="watchlist-empty-cta"
          style={styles.cta}
        >
          <Text style={styles.ctaLabel}>{t("watchlist.empty.cta")}</Text>
        </Pressable>
      )}
    </View>
  );
});

TrackerWatchlistListEmptyStateView.displayName =
  "TrackerWatchlistListEmptyStateView";

const styles = StyleSheet.create({
  container: {
    paddingVertical: 64,
    alignItems: "center",
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 16,
    color: "#1a1a1a",
  },
  body: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    color: "#808080",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  cta: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
  },
  ctaLabel: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 15,
    color: "#ffffff",
  },
});
