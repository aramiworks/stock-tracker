import { memo } from "react";
import { XStack, YStack } from "tamagui";
import { Text, Button } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

type TrackerErrorStateViewProps = {
  title?: string;
  subtitle?: string;
  retryLabel?: string;
  onRetry?: () => void;
  width?: number;
  height?: number;
  testID?: string;
};

export const TrackerErrorStateView = memo(
  ({
    title,
    subtitle,
    retryLabel,
    onRetry,
    width = 340,
    height = 240,
    testID,
  }: TrackerErrorStateViewProps) => {
    const { t } = useTranslation("tracker");
    const resolvedTitle = title ?? t("dashboard.errorState.title");
    const resolvedSubtitle = subtitle ?? t("dashboard.errorState.subtitle");
    const resolvedRetryLabel = retryLabel ?? t("dashboard.errorState.retry");
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
        <XStack
          width={48}
          height={48}
          borderRadius={24}
          backgroundColor="#FFE8ED"
          alignItems="center"
          justifyContent="center"
          marginBottom={16}
        >
          <Text role="headline" size="small" fontWeight="700" color="#FF2D55">
            !
          </Text>
        </XStack>
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
          onPress={onRetry}
          testID={testID ? `${testID}-retry` : undefined}
          marginTop={24}
        >
          {resolvedRetryLabel}
        </Button>
      </YStack>
    );
  },
);

TrackerErrorStateView.displayName = "TrackerErrorStateView";
