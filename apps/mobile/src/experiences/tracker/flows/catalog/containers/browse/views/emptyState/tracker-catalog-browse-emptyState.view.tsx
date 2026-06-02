import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

export const TrackerCatalogBrowseEmptyStateView = memo(() => {
  const { t } = useTranslation("tracker");
  return (
    <View style={styles.container} testID="catalog-empty-state">
      <Text style={styles.title}>{t("catalog.empty.title")}</Text>
      <Text style={styles.body}>{t("catalog.empty.body")}</Text>
    </View>
  );
});

TrackerCatalogBrowseEmptyStateView.displayName =
  "TrackerCatalogBrowseEmptyStateView";

const styles = StyleSheet.create({
  container: {
    paddingVertical: 64,
    alignItems: "center",
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 16,
    color: "#1a1a1a",
  },
  body: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    color: "#808080",
    marginTop: 6,
    textAlign: "center",
  },
});
