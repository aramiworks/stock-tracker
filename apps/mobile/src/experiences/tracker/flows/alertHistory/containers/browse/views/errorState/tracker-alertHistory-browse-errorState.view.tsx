import { memo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "@aramiworks/ui";

type Props = {
  /**
   * Tap handler for the "다시 시도" retry pill. When omitted the button still
   * renders so the visual matches Figma — useful for Storybook and tests where
   * a controller-side refetch isn't wired up.
   */
  onRetry?: () => void;
};

/**
 * Alert-history error state — Figma 623:1216.
 *
 *   card                @ flex:1, bg #fafafa, radius 12
 *   error icon          @ 48×48 circle (#e6f0ff tint), '!' Inter Bold 28 /
 *                         colors.primary (#0066FF), centered, marginTop 21
 *   title               @ Inter SemiBold 17 / #1a1a1a, centered, marginTop 19
 *   body                @ Inter Regular 13 / #999, centered, marginTop 6
 *   retry pill          @ 140×42, bg colors.primary, radius 21,
 *                         label Inter SemiBold 14 / #fff, marginTop 30
 *
 * Used by the views composer when the upstream query fails — when no
 * `onRetry` is supplied the button is still visible but does nothing on
 * press, matching the layout from the Figma frame without coupling to a
 * specific controller-level refetch.
 */
export const TrackerAlertHistoryBrowseErrorStateView = memo(
  ({ onRetry }: Props) => {
    const { t } = useTranslation("tracker");
    return (
      <View style={styles.card} testID="alert-history-error-state">
        <View style={styles.iconWrapper} testID="alert-history-error-icon">
          <Text style={styles.iconGlyph}>!</Text>
        </View>
        <Text style={styles.title}>{t("alertHistory.error.title")}</Text>
        <Text style={styles.body}>{t("alertHistory.error.body")}</Text>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={t("alertHistory.error.retry")}
          testID="alert-history-error-retry"
          style={styles.retry}
        >
          <Text style={styles.retryLabel}>{t("alertHistory.error.retry")}</Text>
        </Pressable>
      </View>
    );
  },
);

TrackerAlertHistoryBrowseErrorStateView.displayName =
  "TrackerAlertHistoryBrowseErrorStateView";

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    alignItems: "center",
    paddingTop: 21,
    paddingHorizontal: 24,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e6f0ff",
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlyph: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 28,
    lineHeight: 32,
    color: colors.primary,
    textAlign: "center",
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 17,
    color: "#1a1a1a",
    textAlign: "center",
    marginTop: 19,
  },
  body: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 13,
    color: "#999999",
    textAlign: "center",
    marginTop: 6,
  },
  retry: {
    marginTop: 30,
    width: 140,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  retryLabel: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#ffffff",
  },
});
