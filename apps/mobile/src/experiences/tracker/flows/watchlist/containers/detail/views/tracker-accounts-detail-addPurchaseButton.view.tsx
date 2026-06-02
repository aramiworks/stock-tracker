import { memo } from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { colors } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

type Props = {
  onPress: () => void;
};

export const TrackerAccountsDetailAddPurchaseButtonView = memo<Props>(
  ({ onPress }) => {
    const { t } = useTranslation("tracker");
    return (
      <Pressable
        style={styles.button}
        onPress={onPress}
        testID="accounts-detail-add-purchase"
      >
        <Text style={styles.label}>{t("accounts.detail.addPurchase")}</Text>
      </Pressable>
    );
  },
);

TrackerAccountsDetailAddPurchaseButtonView.displayName =
  "TrackerAccountsDetailAddPurchaseButtonView";

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: colors.primary,
  },
});
