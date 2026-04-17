import { memo } from "react";
import { XStack, YStack, Text } from "@aramiworks/ui";

type PurchaseRowType = "regular" | "tank";

type TrackerPurchaseRowViewProps = {
  type?: PurchaseRowType;
  productName?: string;
  date?: string;
  amount?: number;
  testID?: string;
};

export const TrackerPurchaseRowView = memo(
  ({
    type = "regular",
    productName = "트리니티 링",
    date = "2024.03.15",
    amount = 3200000,
    testID,
  }: TrackerPurchaseRowViewProps) => {
    const formattedAmount = `+₩${amount.toLocaleString()}`;

    return (
      <XStack
        width={220}
        height={56}
        alignItems="flex-start"
        position="relative"
        overflow="hidden"
        testID={testID}
      >
        {type === "tank" && (
          <XStack
            position="absolute"
            left={0}
            top={4}
            width={4}
            height={44}
            backgroundColor="#009E99"
            borderRadius={2}
          />
        )}
        <YStack flex={1} marginLeft={type === "tank" ? 16 : 0}>
          <Text role="label" size="large" fontWeight="500" color="#1A1A1A">
            {productName}
          </Text>
          <Text role="label" size="small" color="#999" marginTop={4}>
            {date}
          </Text>
        </YStack>
        <Text role="label" size="large" fontWeight="600" color="#1A1A1A">
          {formattedAmount}
        </Text>
      </XStack>
    );
  },
);

TrackerPurchaseRowView.displayName = "TrackerPurchaseRowView";
