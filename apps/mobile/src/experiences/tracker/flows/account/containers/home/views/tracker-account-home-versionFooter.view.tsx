import { memo } from "react";
import { Text, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Constants from "expo-constants";

export const TrackerAccountHomeVersionFooterView = memo(() => {
  const { t } = useTranslation("tracker");
  const version = Constants.expoConfig?.version ?? "0.0.0";
  return (
    <View style={styles.container}>
      <Text style={styles.text} testID="version-footer">
        {t("account.home.versionFooter.label", "버전")} v{version}
      </Text>
    </View>
  );
});

TrackerAccountHomeVersionFooterView.displayName =
  "TrackerAccountHomeVersionFooterView";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  text: {
    fontFamily: "Inter",
    fontSize: 12,
    color: "#49454F",
    opacity: 0.6,
  },
});
