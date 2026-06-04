import { memo } from "react";
import { View, StyleSheet } from "react-native";
import { Card, Skeleton, XStack, YStack } from "@aramiworks/ui";

export const TrackerAccountHomeLoadingStateView = memo(() => (
  <Card variant="outlined" testID="account-home-loading-card">
    <YStack padding={16} gap={20}>
      <XStack justifyContent="space-between" alignItems="center">
        <Skeleton width={48} height={14} />
        <Skeleton width={140} height={14} />
      </XStack>
      <View style={styles.divider} />
      <XStack justifyContent="space-between" alignItems="center">
        <Skeleton width={48} height={14} />
        <Skeleton width={100} height={14} />
      </XStack>
    </YStack>
  </Card>
));

TrackerAccountHomeLoadingStateView.displayName =
  "TrackerAccountHomeLoadingStateView";

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
});
