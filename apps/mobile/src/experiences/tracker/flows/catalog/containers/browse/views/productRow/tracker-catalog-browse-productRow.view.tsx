import { memo } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Checkbox } from "@aramiworks/ui";
import type { CatalogUnit } from "../../models/tracker-catalog-browse.type";

type Props = {
  unit: CatalogUnit;
  checked: boolean;
  onTogglePress?: () => void;
};

export const TrackerCatalogBrowseProductRowView = memo(
  ({ unit, checked, onTogglePress }: Props) => {
    const testID = `catalog-row-${unit.id}`;
    return (
      <Pressable
        onPress={onTogglePress}
        accessibilityRole="button"
        testID={testID}
      >
        <View style={styles.row}>
          <Checkbox
            state={checked ? "checked" : "unchecked"}
            onPress={onTogglePress}
            accessibilityLabel={unit.modelName}
            testID={`${testID}-checkbox`}
          />
          <Text style={styles.name}>{unit.modelName}</Text>
        </View>
        <View style={styles.divider} />
      </Pressable>
    );
  },
);

TrackerCatalogBrowseProductRowView.displayName =
  "TrackerCatalogBrowseProductRowView";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    // Indent items 32px under their product-line header (Figma 869:19 checkbox
    // sits at left-32 vs the group header's left-0) so "Kelly" → "Kelly 28"
    // reads as a hierarchy.
    paddingLeft: 32,
    paddingRight: 16,
  },
  name: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 15,
    color: "#1a1a1a",
    marginLeft: 4,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#ededed",
    // Align under the (indented) checkbox left edge, matching Figma row-divider
    // at left-32.
    marginLeft: 32,
  },
});
