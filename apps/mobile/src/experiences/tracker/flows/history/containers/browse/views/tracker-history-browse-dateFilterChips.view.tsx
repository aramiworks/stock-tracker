import { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

type DateFilter = "thisMonth" | "threeMonths" | "thisYear" | "all";

type TrackerHistoryBrowseDateFilterChipsViewProps = {
  selected?: DateFilter;
  onSelect?: (filter: DateFilter) => void;
};

const FILTER_KEYS: DateFilter[] = [
  "thisMonth",
  "threeMonths",
  "thisYear",
  "all",
];

export const TrackerHistoryBrowseDateFilterChipsView = memo(
  ({
    selected = "thisMonth",
    onSelect,
  }: TrackerHistoryBrowseDateFilterChipsViewProps) => {
    const { t } = useTranslation("tracker");
    return (
      <View style={styles.container}>
        {FILTER_KEYS.map((key) => {
          const isSelected = key === selected;
          return (
            <Pressable
              key={key}
              testID={`date-filter-${key}`}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelect?.(key)}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {t(`history.browse.filters.${key}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  },
);

TrackerHistoryBrowseDateFilterChipsView.displayName =
  "TrackerHistoryBrowseDateFilterChipsView";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    height: 28,
  },
  chip: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  chipSelected: {
    backgroundColor: "#FF2D55",
    borderColor: "#FF2D55",
  },
  chipText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 11,
    color: "#666",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
});
