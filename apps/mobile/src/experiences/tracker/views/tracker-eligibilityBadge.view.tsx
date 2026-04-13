import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
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
      <View
        style={[
          styles.badge,
          { backgroundColor: isEligible ? "#E8F7ED" : "#FFE8ED" },
        ]}
        testID={testID}
      >
        <Text
          style={[styles.text, { color: isEligible ? "#219654" : "#FF2D55" }]}
        >
          {isEligible
            ? t("eligibility.eligible")
            : t("eligibility.notEligible")}
        </Text>
      </View>
    );
  },
);

TrackerEligibilityBadgeView.displayName = "TrackerEligibilityBadgeView";

const styles = StyleSheet.create({
  badge: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  text: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
  },
});
