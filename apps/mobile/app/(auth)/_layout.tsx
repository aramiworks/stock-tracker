import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../src/experiences/auth/models/auth.store";

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (!isLoading && isAuthenticated) {
    return <Redirect href="/tracker/alerts/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
