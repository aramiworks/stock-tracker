import { memo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const TrackerDashboardHomeProfileAvatarView = memo(() => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/tracker/account/home")}
      style={styles.avatar}
      testID="profile-avatar"
      accessibilityRole="button"
      accessibilityLabel="계정"
    >
      <MaterialCommunityIcons name="account" size={18} color="#49454F" />
    </Pressable>
  );
});

TrackerDashboardHomeProfileAvatarView.displayName =
  "TrackerDashboardHomeProfileAvatarView";

const styles = StyleSheet.create({
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8E0EC",
    alignItems: "center",
    justifyContent: "center",
  },
});
