import { memo } from "react";
import { XStack, YStack, Button, EmptyStateTemplate } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

type TrackerEmptyStateViewProps = {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  testID?: string;
};

export const TrackerEmptyStateView = memo(
  ({
    icon,
    title,
    subtitle,
    ctaLabel,
    onCtaPress,
    testID,
  }: TrackerEmptyStateViewProps) => {
    const { t } = useTranslation("tracker");
    const resolvedTitle = title ?? t("dashboard.emptyState.title");
    const resolvedSubtitle = subtitle ?? t("dashboard.emptyState.subtitle");
    const resolvedCtaLabel = ctaLabel ?? t("dashboard.emptyState.cta");
    return (
      <EmptyStateTemplate
        icon={icon ?? <BagIcon />}
        title={resolvedTitle}
        body={resolvedSubtitle}
        action={
          <Button
            variant="filled"
            onPress={onCtaPress}
            testID={testID ? `${testID}-cta` : undefined}
          >
            {resolvedCtaLabel}
          </Button>
        }
        testID={testID}
      />
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
