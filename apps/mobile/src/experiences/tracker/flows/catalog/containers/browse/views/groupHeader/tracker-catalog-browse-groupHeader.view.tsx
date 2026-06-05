import { memo } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Checkbox } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import type {
  CatalogGroup,
  GroupSelectionState,
} from "../../models/tracker-catalog-browse.type";

type Props = {
  group: CatalogGroup;
  state: GroupSelectionState;
  onTogglePress?: () => void;
};

const STATE_TO_CHECKBOX: Record<
  GroupSelectionState,
  "checked" | "indeterminate" | "unchecked"
> = {
  all: "checked",
  some: "indeterminate",
  none: "unchecked",
};

export const TrackerCatalogBrowseGroupHeaderView = memo(
  ({ group, state, onTogglePress }: Props) => {
    const { t } = useTranslation("tracker");
    const checkboxState = STATE_TO_CHECKBOX[state];
    const testID = `catalog-group-${group.brand}-${group.productLine}`;

    return (
      <Pressable
        onPress={onTogglePress}
        accessibilityRole="button"
        testID={testID}
      >
        <View style={styles.row}>
          <Checkbox
            state={checkboxState}
            onPress={onTogglePress}
            accessibilityLabel={`${group.productLine} 전체`}
            testID={`${testID}-checkbox`}
          />
          <View style={styles.copy}>
            <Text style={styles.line}>{group.productLine}</Text>
            <Text style={styles.subtitle}>
              {t("catalog.groupSubtitle", "전체")}
            </Text>
          </View>
          <Text style={styles.brand}>{group.brand}</Text>
        </View>
      </Pressable>
    );
  },
);

TrackerCatalogBrowseGroupHeaderView.displayName =
  "TrackerCatalogBrowseGroupHeaderView";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingRight: 16,
  },
  copy: {
    marginLeft: 4,
    flex: 1,
  },
  line: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 15,
    color: "#1a1a1a",
  },
  subtitle: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#808080",
    marginTop: 2,
  },
  brand: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#999999",
  },
});
