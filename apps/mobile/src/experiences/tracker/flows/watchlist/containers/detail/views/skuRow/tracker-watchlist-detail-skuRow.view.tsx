import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrackerWatchlistListStatePillView } from "../../../list/views/statePill/tracker-watchlist-list-statePill.view";
import type { DetailSku } from "../../models/tracker-watchlist-detail.type";

type Props = {
  sku: DetailSku;
};

/**
 * Detail SKU row — Figma 846-57 (Cartier multi-SKU canonical).
 *
 * Left column: descriptor @ 15pt Medium #1a1a1a, then reference code
 *              (or "Hermès 공식" source label when null) @ 12pt Regular #808080.
 * Right column: StatePill aligned to the right.
 */
export const TrackerWatchlistDetailSkuRowView = memo(({ sku }: Props) => {
  const referenceLabel = sku.referenceCode ?? "Hermès 공식";
  const testID = `watchlist-detail-sku-${sku.id}`;

  return (
    <View style={styles.row} testID={testID}>
      <View style={styles.left}>
        <Text style={styles.descriptor}>{sku.descriptor}</Text>
        <Text style={styles.ref}>{referenceLabel}</Text>
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
  descriptor: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 15,
    color: "#1a1a1a",
  },
  ref: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#808080",
    marginTop: 2,
  },
});
