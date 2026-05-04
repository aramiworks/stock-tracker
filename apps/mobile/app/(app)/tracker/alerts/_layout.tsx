import { Stack } from "expo-router";
import { useTrackerDashboardLifecycle } from "@/experiences/tracker/flows/alerts/lifecycles";

export default function TrackerDashboardLayout() {
  useTrackerDashboardLifecycle();
  return <Stack screenOptions={{ headerShown: false }} />;
}
