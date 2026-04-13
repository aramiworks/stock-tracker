import { memo } from "react";
import { View, StyleSheet } from "react-native";

type TrackerSkeletonCardViewProps = {
  width?: number;
  height?: number;
  testID?: string;
};

export const TrackerSkeletonCardView = memo(
  ({ width = 310, height = 100, testID }: TrackerSkeletonCardViewProps) => {
    return (
      <View style={[styles.container, { width, height }]} testID={testID}>
        <View style={styles.avatarPlaceholder} />
        <View style={styles.textGroup}>
          <View style={[styles.skeletonLine, { width: 100, height: 12 }]} />
          <View
            style={[
              styles.skeletonLine,
              { width: 80, height: 10, marginTop: 6 },
            ]}
          />
          <View
            style={[
              styles.skeletonLine,
              { width: 120, height: 10, marginTop: 6 },
            ]}
          />
        </View>
      </View>
    );
  },
);

TrackerSkeletonCardView.displayName = "TrackerSkeletonCardView";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0E0E0",
  },
  textGroup: {
    marginLeft: 12,
  },
  skeletonLine: {
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
  },
});
