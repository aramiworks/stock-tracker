import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "@aramiworks/ui";
import { useRelativeTimeFormatter } from "@/shared/hooks/use-relative-time";
import { stateColors } from "@/shared/tokens";
import type { DetailDropEvent } from "../../models/tracker-watchlist-detail.type";

type Props = {
  event: DetailDropEvent;
};

const KIND_COLOR: Record<DetailDropEvent["kind"], string> = {
  restocked: stateColors.green,
  out_of_stock: colors.primary,
};

const KIND_I18N: Record<DetailDropEvent["kind"], string> = {
  restocked: "watchlist.detail.events.restocked",
  out_of_stock: "watchlist.detail.events.outOfStock",
};

/**
 * Detail history row — Figma 846-2 / 846-57.
 *
 * Two-line layout: a 10px dot @ kind color, then the event label
 * (재입고|품절) @ 15pt Medium #1a1a1a on line 1 and the SKU line
 * ("refCode · descriptor", or descriptor alone when refCode is null)
 * @ 12pt Regular #808080 on line 2. Right-aligned relative timestamp.
 * Each row carries a 1px #ededed bottom divider.
 */
export const TrackerWatchlistDetailHistoryRowView = memo(({ event }: Props) => {
  const { t } = useTranslation("tracker");
  const formatRelative = useRelativeTimeFormatter();
  const color = KIND_COLOR[event.kind];
  const testID = `watchlist-detail-history-${event.id}`;
  const skuLine = event.referenceCode
    ? `${event.referenceCode} · ${event.skuDescriptor}`
    : event.skuDescriptor;

  return (
    <View style={styles.row} testID={testID}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.body}>
        <Text style={styles.label}>{t(KIND_I18N[event.kind])}</Text>
        <Text style={styles.descriptor}>{skuLine}</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: "#ededed",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  label: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 15,
    color: "#1a1a1a",
  },
  descriptor: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#808080",
    marginTop: 2,
  },
  timestamp: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#808080",
    marginLeft: 8,
  },
});
