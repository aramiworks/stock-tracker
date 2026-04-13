import { memo } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { TrackerPurchaseRowView } from "@/experiences/tracker/views";

type TrackerAccountsDetailPurchaseRowViewProps = {
  id?: string;
  type?: "regular" | "tank";
  productName?: string;
  date?: string;
  amount?: number;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const TrackerAccountsDetailPurchaseRowView = memo(
  ({
    id,
    onEdit,
    onDelete,
    ...props
  }: TrackerAccountsDetailPurchaseRowViewProps) => {
    return (
      <View style={styles.container}>
        <View style={styles.rowContent}>
          <TrackerPurchaseRowView
            {...props}
            testID={id ? `purchase-row-${id}` : undefined}
          />
        </View>
        {(onEdit || onDelete) && (
          <View style={styles.actions}>
            {onEdit && (
              <Pressable
                onPress={onEdit}
                style={styles.actionButton}
                testID={id ? `purchase-edit-${id}` : undefined}
              >
                <Text style={styles.actionIcon}>✏️</Text>
              </Pressable>
            )}
            {onDelete && (
              <Pressable
                onPress={onDelete}
                style={styles.actionButton}
                testID={id ? `purchase-delete-${id}` : undefined}
              >
                <Text style={styles.actionIcon}>🗑️</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    );
  },
);

TrackerAccountsDetailPurchaseRowView.displayName =
  "TrackerAccountsDetailPurchaseRowView";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowContent: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 6,
  },
  actionIcon: {
    fontSize: 16,
  },
});
