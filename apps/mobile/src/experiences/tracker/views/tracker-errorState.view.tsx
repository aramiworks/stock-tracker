import { memo } from "react";
import { XStack, Button, EmptyStateTemplate, Text } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import { stateColors } from "@/shared/tokens/state";

type TrackerErrorStateViewProps = {
  title?: string;
  subtitle?: string;
  retryLabel?: string;
  onRetry?: () => void;
  testID?: string;
};

export const TrackerErrorStateView = memo(
  ({
    title,
    subtitle,
    retryLabel,
    onRetry,
    testID,
  }: TrackerErrorStateViewProps) => {
    const { t } = useTranslation("tracker");
    const resolvedTitle = title ?? t("dashboard.errorState.title");
    const resolvedSubtitle = subtitle ?? t("dashboard.errorState.subtitle");
    const resolvedRetryLabel = retryLabel ?? t("dashboard.errorState.retry");
    return (
      <EmptyStateTemplate
        icon={<ErrorIcon />}
        title={resolvedTitle}
        body={resolvedSubtitle}
        action={
          <Button
            variant="filled"
            onPress={onRetry}
            testID={testID ? `${testID}-retry` : undefined}
          >
            {resolvedRetryLabel}
          </Button>
        }
        testID={testID}
      />
    );
  },
);

TrackerErrorStateView.displayName = "TrackerErrorStateView";

const ErrorIcon = memo(() => (
  <XStack
    width={48}
    height={48}
    borderRadius={24}
    backgroundColor="#FFE8ED"
    alignItems="center"
    justifyContent="center"
  >
    <Text role="headline" size="small" fontWeight="700" color={stateColors.red}>
      !
    </Text>
  </XStack>
));

ErrorIcon.displayName = "ErrorIcon";
