import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrackerWatchlistListStatePillView } from "../../list/views/tracker-watchlist-list-statePill.view";
import type { DetailSku } from "../models/tracker-watchlist-detail.type";

type Props = {
  sku: DetailSku;
};

/**
 * Detail SKU row — Figma 846-57 (Cartier multi-SKU canonical).
 *
 * Left column: reference code (or "Hermès 공식" source label when null)
 *              @ 13pt Medium #1a1a1a, descriptor @ 12pt Regular #808080.
 * Right column: StatePill aligned to the right.
 */
export const TrackerWatchlistDetailSkuRowView = memo(({ sku }: Props) => {
  const referenceLabel = sku.referenceCode ?? "Hermès 공식";
  const testID = `watchlist-detail-sku-${sku.id}`;

  return (
    <View style={styles.row} testID={testID}>
      <View style={styles.left}>
        <Text style={styles.ref}>{referenceLabel}</Text>
        <Text style={styles.descriptor}>{sku.descriptor}</Text>
      </View>
      <TrackerWatchlistListStatePillView
        state={sku.state}
        testID={`${testID}-state`}
      />
    </View>
  );
});

TrackerWatchlistDetailSkuRowView.displayName =
  "TrackerWatchlistDetailSkuRowView";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ededed",
  },
  left: {
    flex: 1,
  },
  ref: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 13,
    color: "#1a1a1a",
  },
  descriptor: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#808080",
    marginTop: 2,
  },
});
