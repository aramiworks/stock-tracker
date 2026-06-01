import { memo } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
};

export const TrackerAccountsDetailTrailingActionsView = memo<Props>(
  ({ onEdit, onDelete }) => {
    const { t } = useTranslation("tracker");
    if (!onEdit && !onDelete) return null;
    return (
      <View style={styles.row}>
        {onEdit && (
          <Pressable
            onPress={onEdit}
            style={styles.action}
            testID="accounts-detail-edit"
          >
            <Text style={styles.editLabel}>
              {t("accounts.detail.editAction")}
            </Text>
          </Pressable>
        )}
        {onDelete && (
          <Pressable
            onPress={onDelete}
            style={styles.action}
            testID="accounts-detail-delete"
          >
            <Text style={styles.deleteLabel}>
              {t("accounts.detail.deleteAction")}
            </Text>
          </Pressable>
        )}
      </View>
    );
  },
);

TrackerAccountsDetailTrailingActionsView.displayName =
  "TrackerAccountsDetailTrailingActionsView";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  action: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editLabel: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#FF2D55",
  },
  deleteLabel: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#999",
  },
});
