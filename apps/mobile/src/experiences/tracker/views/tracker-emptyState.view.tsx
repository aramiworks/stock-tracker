import { memo } from "react";
import { XStack, YStack } from "tamagui";
import { Text, Button } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

type TrackerEmptyStateViewProps = {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  width?: number;
  height?: number;
  testID?: string;
};

export const TrackerEmptyStateView = memo(
  ({
    icon,
    title,
    subtitle,
    ctaLabel,
    onCtaPress,
    width = 340,
    height = 240,
    testID,
  }: TrackerEmptyStateViewProps) => {
    const { t } = useTranslation("tracker");
    const resolvedTitle = title ?? t("dashboard.emptyState.title");
    const resolvedSubtitle = subtitle ?? t("dashboard.emptyState.subtitle");
    const resolvedCtaLabel = ctaLabel ?? t("dashboard.emptyState.cta");
    return (
      <YStack
        width={width}
        height={height}
        backgroundColor="#FAFAFA"
        borderRadius={12}
        overflow="hidden"
        alignItems="center"
        justifyContent="center"
        testID={testID}
      >
        <XStack marginBottom={16}>{icon ?? <BagIcon />}</XStack>
        <Text
          role="body"
          size="medium"
          fontWeight="600"
          color="#1A1A1A"
          textAlign="center"
        >
          {resolvedTitle}
        </Text>
        <Text
          role="label"
          size="medium"
          color="#999"
          textAlign="center"
          marginTop={8}
        >
          {resolvedSubtitle}
        </Text>
        <Button
          variant="filled"
          onPress={onCtaPress}
          testID={testID ? `${testID}-cta` : undefined}
          marginTop={24}
        >
          {resolvedCtaLabel}
        </Button>
      </YStack>
    );
  },
);

TrackerEmptyStateView.displayName = "TrackerEmptyStateView";

const BagIcon = memo(() => (
  <YStack width={40} height={56} alignItems="center">
    <XStack
      width={22}
      height={16}
      borderRadius={11}
      borderWidth={3}
      borderColor="#FFE8ED"
    />
    <XStack
      width={40}
      height={44}
      backgroundColor="#FFE8ED"
      borderRadius={6}
      marginTop={-4}
    />
  </YStack>
));

BagIcon.displayName = "BagIcon";
