import { Stack } from "expo-router";
import { useTrackerCatalogLifecycle } from "@/experiences/tracker/flows/catalog/lifecycles";

export default function TrackerCatalogLayout() {
  useTrackerCatalogLifecycle();
  return <Stack screenOptions={{ headerShown: false }} />;
}
