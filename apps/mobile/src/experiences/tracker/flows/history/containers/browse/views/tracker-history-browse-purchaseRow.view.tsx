import { memo } from "react";
import { Pressable } from "react-native";
import { TrackerPurchaseRowView } from "@/experiences/tracker/views";

type TrackerHistoryBrowsePurchaseRowViewProps = {
  type?: "regular" | "tank";
  productName?: string;
  date?: string;
  amount?: number;
  onLongPress?: () => void;
};

export const TrackerHistoryBrowsePurchaseRowView = memo(
  ({ onLongPress, ...props }: TrackerHistoryBrowsePurchaseRowViewProps) => {
    return (
      <Pressable onLongPress={onLongPress} disabled={!onLongPress}>
        <TrackerPurchaseRowView {...props} />
      </Pressable>
    );
  },
);

TrackerHistoryBrowsePurchaseRowView.displayName =
  "TrackerHistoryBrowsePurchaseRowView";
