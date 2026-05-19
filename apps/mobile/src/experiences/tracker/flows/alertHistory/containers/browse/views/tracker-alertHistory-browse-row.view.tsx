import { memo } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { stateColors } from "@/shared/tokens";
import type {
  AlertHistoryEvent,
  AlertHistoryEventKind,
} from "../models/tracker-alertHistory-browse.type";

type Props = {
  event: AlertHistoryEvent;
  onPress?: (event: AlertHistoryEvent) => void;
};

/**
 * Alert-history list row — 47px content + 12px gap (Figma 623:1129).
 *
 *   Optional left indicator bar     @ 4×44, x=0, y=4, radius 2, stateColors.teal
 *                                     (only rendered when kind === "soldOut")
 *   modelName                       @ top, Inter Medium 14 / #1a1a1a
 *                                     indent +16px when soldOut bar is present
 *   kind label ("재입고" | "품절")    @ top, just right of modelName,
 *                                     Inter SemiBold 14 / #1a1a1a
 *   {YYYY.MM.DD} · {brand}          @ bottom, Inter Regular 11 / #999
 *
 * Tapping the row pushes `/tracker/watchlist/[id]` keyed by `watchableUnitId`,
 * so the user can drill into the unit's detail (Shengsho watchlist/detail).
 *
 * Spec: design hand-off INF-1478 (default 623:1129, empty 623:1150, loading
 * 623:1183, optional error 623:1216).
 */

const I18N_KIND_KEY: Record<AlertHistoryEventKind, string> = {
  restocked: "alertHistory.event.restocked",
  soldOut: "alertHistory.event.soldOut",
};

const A11Y_KIND: Record<AlertHistoryEventKind, string> = {
  restocked: "재입고",
  soldOut: "품절",
};

/**
 * Render an ISO 8601 timestamp as `YYYY.MM.DD` using the calendar date of the
 * input (UTC components — matches the timestamps in `ALERT_HISTORY_MOCK`). For
 * malformed input the row falls back to `"—"` so it never crashes.
 */
const formatYmd = (iso: string): string => {
  const d = new Date(iso);
  /* istanbul ignore next -- defensive against malformed timestamps */
  if (Number.isNaN(d.getTime())) return "—";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
};

export const TrackerAlertHistoryBrowseRowView = memo(
  ({ event, onPress }: Props) => {
    const { t } = useTranslation("tracker");
    const testID = `alert-history-row-${event.id}`;
    const isSoldOut = event.kind === "soldOut";

    const primaryStyle = [
      styles.primary,
      isSoldOut ? styles.primaryWithBar : null,
    ];

    return (
      <Pressable
        onPress={onPress ? () => onPress(event) : undefined}
        accessibilityRole="button"
        accessibilityLabel={`${event.modelName} · ${A11Y_KIND[event.kind]}`}
        testID={testID}
        style={styles.pressable}
      >
        {isSoldOut && (
          <View style={styles.bar} testID={`${testID}-bar`} />
        )}
        <View style={styles.row}>
          <View style={styles.topLine}>
            <Text style={primaryStyle} numberOfLines={1}>
              {event.modelName}
            </Text>
            <Text style={styles.kind} numberOfLines={1}>
              {t(I18N_KIND_KEY[event.kind])}
            </Text>
          </View>
          <Text
            style={[styles.meta, isSoldOut ? styles.metaWithBar : null]}
            numberOfLines={1}
          >
            {`${formatYmd(event.detectedAt)} · ${event.brand}`}
          </Text>
        </View>
      </Pressable>
    );
  },
);

TrackerAlertHistoryBrowseRowView.displayName =
  "TrackerAlertHistoryBrowseRowView";

const styles = StyleSheet.create({
  pressable: {
    position: "relative",
    paddingVertical: 4,
    marginBottom: 12,
  },
  bar: {
    position: "absolute",
    width: 4,
    height: 44,
    top: 4,
    left: 0,
    borderRadius: 2,
    backgroundColor: stateColors.teal,
  },
  row: {
    minHeight: 47,
    justifyContent: "center",
  },
  topLine: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  primary: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    color: "#1a1a1a",
  },
  primaryWithBar: {
    marginLeft: 16,
  },
  kind: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#1a1a1a",
    marginLeft: 8,
  },
  meta: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 11,
    color: "#999999",
    marginTop: 2,
  },
  metaWithBar: {
    marginLeft: 16,
  },
});
