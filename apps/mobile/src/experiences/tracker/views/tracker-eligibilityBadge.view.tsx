import { memo } from "react";
import { XStack, Text } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

type EligibilityBadgeStatus = "eligible" | "notEligible";

type TrackerEligibilityBadgeViewProps = {
  status?: EligibilityBadgeStatus;
  testID?: string;
};

export const TrackerEligibilityBadgeView = memo(
  ({
    status = "eligible",
    testID = "eligibility-badge",
  }: TrackerEligibilityBadgeViewProps) => {
    const { t } = useTranslation("tracker");
    const isEligible = status === "eligible";

    return (
      <XStack
        height={36}
        borderRadius={18}
        paddingHorizontal={14}
        alignItems="center"
        justifyContent="center"
        alignSelf="flex-start"
        overflow="hidden"
        backgroundColor={isEligible ? "#E8F7ED" : "#FFE8ED"}
        testID={testID}
      >
        <Text
          role="label"
          size="large"
          fontWeight="600"
          color={isEligible ? "#219654" : "#FF2D55"}
        >
          {isEligible
            ? t("eligibility.eligible")
            : t("eligibility.notEligible")}
        </Text>
      </XStack>
    );
  },
);

TrackerEligibilityBadgeView.displayName = "TrackerEligibilityBadgeView";
