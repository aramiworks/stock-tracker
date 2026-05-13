import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useRelativeTimeFormatter } from "@/shared/hooks/use-relative-time";
import { stateColors } from "@/shared/tokens";
import type { DetailDropEvent } from "../models/tracker-watchlist-detail.type";

type Props = {
  event: DetailDropEvent;
};

const KIND_COLOR: Record<DetailDropEvent["kind"], string> = {
  restocked: stateColors.green,
  out_of_stock: stateColors.red,
};

const KIND_I18N: Record<DetailDropEvent["kind"], string> = {
  restocked: "watchlist.detail.events.restocked",
  out_of_stock: "watchlist.detail.events.outOfStock",
};

/**
 * Detail history row — Figma 846-2.
 *
 * Layout: dot @ kind color · label (재입고|품절) @ 13pt Medium · descriptor
 * (sku.descriptor) @ 12pt #808080. Right-aligned relative timestamp.
 */
export const TrackerWatchlistDetailHistoryRowView = memo(({ event }: Props) => {
  const { t } = useTranslation("tracker");
  const formatRelative = useRelativeTimeFormatter();
  const color = KIND_COLOR[event.kind];
  const testID = `watchlist-detail-history-${event.id}`;

  return (
    <View style={styles.row} testID={testID}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.body}>
        <Text style={styles.label}>
          <Text style={{ color }}>{t(KIND_I18N[event.kind])}</Text>
          <Text style={styles.separator}> · </Text>
          <Text style={styles.descriptor}>{event.skuDescriptor}</Text>
        </Text>
      </View>
      <Text style={styles.timestamp}>{formatRelative(event.occurredAt)}</Text>
    </View>
  );
});

TrackerWatchlistDetailHistoryRowView.displayName =
  "TrackerWatchlistDetailHistoryRowView";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  label: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 13,
  },
  separator: {
    color: "#c5c5c5",
  },
  descriptor: {
    fontWeight: "400",
    color: "#808080",
    fontSize: 12,
  },
  timestamp: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#808080",
    marginLeft: 8,
  },
});
