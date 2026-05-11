import { Text } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../src/experiences/auth/models/auth.store";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{label}</Text>
  );
}

export default function AppLayout() {
  const { t } = useTranslation("tracker");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/auth/signIn/gmailOauth" />;
  }

  // Shengsho-aligned bottom nav per INF-1391:
  //   Catalog → Watchlist → History (no Alerts tab)
  // The Alerts experience is parked under `_archived_eligibility/` until the
  // Eligibility revival lands.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1A1A1A",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E5E5",
          borderTopWidth: 1,
          paddingTop: 8,
          height: 84,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter",
          fontWeight: "600",
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="tracker/catalog"
        options={{
          title: t("nav.catalog"),
          tabBarIcon: ({ focused }) => <TabIcon label="🛍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tracker/watchlist"
        options={{
          title: t("nav.watchlist"),
          tabBarIcon: ({ focused }) => <TabIcon label="👁" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tracker/history"
        options={{
          title: t("nav.history"),
          tabBarIcon: ({ focused }) => <TabIcon label="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tracker/alerts"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="tracker/account"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
