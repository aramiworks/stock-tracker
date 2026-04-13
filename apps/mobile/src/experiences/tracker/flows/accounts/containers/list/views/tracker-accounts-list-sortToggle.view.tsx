import { memo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { AccountSortBy } from "../models/tracker-accounts-list.type";

type TrackerAccountsListSortToggleViewProps = {
  sortBy: AccountSortBy;
  onToggle: () => void;
};

export const TrackerAccountsListSortToggleView = memo(
  ({ sortBy, onToggle }: TrackerAccountsListSortToggleViewProps) => {
    return (
      <View style={styles.container}>
        <Pressable
          testID="sort-toggle-name"
          style={[styles.chip, sortBy === "store_name" && styles.chipSelected]}
          onPress={sortBy === "store_name" ? undefined : onToggle}
        >
          <Text
            style={[
              styles.chipText,
              sortBy === "store_name" && styles.chipTextSelected,
            ]}
          >
            이름순
          </Text>
        </Pressable>
        <Pressable
          testID="sort-toggle-recent"
          style={[styles.chip, sortBy === "created_at" && styles.chipSelected]}
          onPress={sortBy === "created_at" ? undefined : onToggle}
        >
          <Text
            style={[
              styles.chipText,
              sortBy === "created_at" && styles.chipTextSelected,
            ]}
          >
            최신순
          </Text>
        </Pressable>
      </View>
    );
  },
);

TrackerAccountsListSortToggleView.displayName =
  "TrackerAccountsListSortToggleView";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
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
