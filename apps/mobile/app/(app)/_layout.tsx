import { Redirect, Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { NavigationBar } from "@aramiworks/ui";
import { useAuthStore } from "../../src/experiences/auth/models/auth.store";
import { useNotificationHandlers } from "../../src/experiences/notifications";

// Canonical 4-tab bottom nav (INF-1610, Figma INF-1605/INF-1621).
// Order is index-bound: the Tabs.Screen entries, the NavigationBar
// destinations, and `ROUTE_NAMES` must all stay in the same order.
const ROUTE_NAMES = [
  "tracker/watchlist",
  "tracker/catalog",
  "tracker/history",
  "tracker/account",
] as const;

export default function AppLayout() {
  const { t } = useTranslation("tracker");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Mount push-notification handlers for the authenticated session (foreground
  // banner, deep-link on tap, cold-start tap, Android channel). Called before
  // the auth redirect so hook order stays stable across renders.
  useNotificationHandlers();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/auth/signIn/gmailOauth" />;
  }

  const destinations = [
    {
      icon: "bookmark-border",
      activeIcon: "bookmark",
      label: t("nav.watchlist"),
    },
    { icon: "search", activeIcon: "search", label: t("nav.catalog") },
    {
      icon: "notifications-none",
      activeIcon: "notifications",
      label: t("nav.history"),
    },
    { icon: "person-outline", activeIcon: "person", label: t("nav.account") },
  ];

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <NavigationBar
          destinations={destinations}
          activeIndex={props.state.index}
          onDestinationPress={(index) =>
            props.navigation.navigate(ROUTE_NAMES[index])
          }
        />
      )}
    >
      <Tabs.Screen name="tracker/watchlist" />
      <Tabs.Screen name="tracker/catalog" />
      <Tabs.Screen name="tracker/history" />
      <Tabs.Screen name="tracker/account" />
    </Tabs>
  );
}
