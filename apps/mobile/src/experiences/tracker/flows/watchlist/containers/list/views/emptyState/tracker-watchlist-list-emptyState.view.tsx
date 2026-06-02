import { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

type Props = {
  onAddPress?: () => void;
};

/**
 * Watchlist empty state — mirrors Figma 845-69.
 *
 * Vertical stack:
 *   - 64×64 circular icon (bg #f2f2f2) with "+" glyph (32pt Semi Bold #808080)
 *   - title  17pt Semi Bold #1a1a1a, centered
 *   - body   14pt #808080, centered
 *   - 160×44 pill CTA — bg colors.primary, radius 22, white "+ 추가" 15pt Semi Bold
 *
 * Tapping the CTA dispatches to the Shengsho catalog browse screen (the same
 * destination the top-app-bar "+ 추가" action reaches).
 */
export const TrackerWatchlistListEmptyStateView = memo(
  ({ onAddPress }: Props) => {
    const { t } = useTranslation("tracker");
    return (
      <View style={styles.container} testID="watchlist-empty-state">
        <View style={styles.icon} testID="watchlist-empty-icon">
          <Text style={styles.iconGlyph}>+</Text>
        </View>
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
  },
);

TrackerWatchlistListEmptyStateView.displayName =
  "TrackerWatchlistListEmptyStateView";

const styles = StyleSheet.create({
  container: {
    paddingTop: 160,
    paddingBottom: 64,
    alignItems: "center",
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlyph: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 32,
    color: "#808080",
    lineHeight: 36,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 17,
    color: "#1a1a1a",
    marginTop: 24,
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
  cta: {
    marginTop: 32,
    width: 160,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaLabel: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 15,
    color: "#ffffff",
  },
});
