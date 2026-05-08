import { Redirect } from "expo-router";
import { useAuthStore } from "../src/experiences/auth/models/auth.store";

export default function Index() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/signIn/gmailOauth" />;
  }

  return <Redirect href="/tracker/alerts/home" />;
}
