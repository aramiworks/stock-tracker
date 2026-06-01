import { memo } from "react";
import { Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

export const TrackerAccountsDetailRecentPurchasesLabelView = memo(() => {
  const { t } = useTranslation("tracker");
  return (
    <Text style={styles.label} testID="accounts-detail-recent-purchases-label">
      {t("accounts.detail.recentPurchases")}
    </Text>
  );
});

TrackerAccountsDetailRecentPurchasesLabelView.displayName =
  "TrackerAccountsDetailRecentPurchasesLabelView";

const styles = StyleSheet.create({
  label: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#888",
    alignSelf: "flex-start",
  },
});
