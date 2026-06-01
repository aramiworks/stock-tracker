import { memo } from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  onPress?: () => void;
};

export const TrackerWatchlistListAddButtonView = memo<Props>(({ onPress }) => {
  const { t } = useTranslation("tracker");
  if (!onPress) return null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t("watchlist.actions.add")}
      testID="watchlist-add-products-button"
      style={styles.button}
      hitSlop={8}
    >
      <Text style={styles.label}>{t("watchlist.actions.add")}</Text>
    </Pressable>
  );
});

TrackerWatchlistListAddButtonView.displayName =
  "TrackerWatchlistListAddButtonView";

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 15,
    color: "#ff2d55",
  },
});
