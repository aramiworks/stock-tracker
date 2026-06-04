import { memo } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useRelativeTimeFormatter } from "@/shared/hooks/use-relative-time";
import type {
  WatchlistEntry,
  WatchableState,
} from "../../models/tracker-watchlist-list.type";
import { TrackerWatchlistListStatePillView } from "../statePill/tracker-watchlist-list-statePill.view";

type Props = {
  entry: WatchlistEntry;
  onPress?: (entry: WatchlistEntry) => void;
};

/**
 * Watchlist list row — 358×64.
 *
 * Left column (flex 1):
 *   model name  @ 15pt Medium  (top)
 *   last-restocked relative time @ 12pt Regular #808080 (bottom — "—" if null)
 *
 * Right column:
 *   StatePill                @ middle-right
 *   chevron "›"              @ far right (18pt, #808080)
 *
 * Tapping the row pushes `/tracker/watchlist/[id]`. Spec: design hand-off
 * INF-1414 (frames 845-2 / 846-2). Per-state variants covered by mock:
 * `in_stock`, `out_of_stock`, `unknown`.
 */
export const TrackerWatchlistListRowView = memo(({ entry, onPress }: Props) => {
  const formatRelative = useRelativeTimeFormatter();
  const testID = `watchlist-row-${entry.watchableUnitId}`;

  const a11yState: Record<WatchableState, string> = {
    in_stock: "재입고됨",
    out_of_stock: "품절",
    unknown: "확인중",
  };

  return (
    <Pressable
      onPress={onPress ? () => onPress(entry) : undefined}
      accessibilityRole="button"
      accessibilityLabel={`${entry.modelName} · ${a11yState[entry.state]}`}
      testID={testID}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.name} numberOfLines={1}>
            {entry.modelName}
          </Text>
          <Text style={styles.meta}>
            {formatRelative(entry.lastRestockedAt)}
          </Text>
        </View>
        <View style={styles.right}>
          <TrackerWatchlistListStatePillView
            state={entry.state}
            testID={`${testID}-state`}
          />
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
      <View style={styles.divider} />
    </Pressable>
  );
});

TrackerWatchlistListRowView.displayName = "TrackerWatchlistListRowView";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 64,
    paddingHorizontal: 4,
  },
  left: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 15,
    color: "#1a1a1a",
  },
  meta: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#808080",
    marginTop: 2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chevron: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 18,
    color: "#808080",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#ededed",
  },
});
