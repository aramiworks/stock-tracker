import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { stateColors } from "@/shared/tokens";
import type { WatchableState } from "../../models/tracker-watchlist-list.type";

type Props = {
  state: WatchableState;
  testID?: string;
};

/**
 * State pill atom — 22px tall, 11px radius, 8px dot + 12pt Medium label.
 *
 *   in_stock      → stateColors.green  (iOS systemGreen, design hand-off)
 *   out_of_stock  → stateColors.red    (Cartier red)
 *   unknown       → stateColors.muted  (neutral grey)
 *
 * Spec: design hand-off for INF-1414 (frames 845-2 / 845-69 / 846-2).
 */
const COLORS: Record<WatchableState, string> = {
  in_stock: stateColors.green,
  out_of_stock: stateColors.red,
  unknown: stateColors.muted,
};

const I18N_KEY: Record<WatchableState, string> = {
  in_stock: "watchlist.state.inStock",
  out_of_stock: "watchlist.state.outOfStock",
  unknown: "watchlist.state.unknown",
};

export const TrackerWatchlistListStatePillView = memo(
  ({ state, testID }: Props) => {
    const { t } = useTranslation("tracker");
    const color = COLORS[state];

    return (
      <View
        style={styles.pill}
        accessibilityRole="text"
        accessibilityLabel={t(I18N_KEY[state])}
        testID={testID ?? `watchlist-state-pill-${state}`}
      >
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.label, { color }]}>{t(I18N_KEY[state])}</Text>
      </View>
    );
  },
);

TrackerWatchlistListStatePillView.displayName =
  "TrackerWatchlistListStatePillView";

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 8,
    backgroundColor: "transparent",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
  },
});
