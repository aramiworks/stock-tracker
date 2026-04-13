import { memo } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import type { ItemCategory } from "../models/tracker-history-browse.type";

type TrackerHistoryBrowseCategoryFilterChipsViewProps = {
  selected?: ItemCategory | null;
  onSelect?: (category: ItemCategory | null) => void;
};

const CATEGORIES: ItemCategory[] = [
  "브레이슬릿",
  "목걸이",
  "시계",
  "반지",
  "귀걸이",
  "가방",
  "지갑",
  "벨트",
  "기타",
];

export const TrackerHistoryBrowseCategoryFilterChipsView = memo(
  ({
    selected = null,
    onSelect,
  }: TrackerHistoryBrowseCategoryFilterChipsViewProps) => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Pressable
          testID="category-filter-all"
          style={[styles.chip, selected === null && styles.chipSelected]}
          onPress={() => onSelect?.(null)}
        >
          <Text
            style={[
              styles.chipText,
              selected === null && styles.chipTextSelected,
            ]}
          >
            전체
          </Text>
        </Pressable>
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat;
          return (
            <Pressable
              key={cat}
              testID={`category-filter-${cat}`}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelect?.(cat)}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  },
);

TrackerHistoryBrowseCategoryFilterChipsView.displayName =
  "TrackerHistoryBrowseCategoryFilterChipsView";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    height: 28,
    paddingHorizontal: 20,
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
