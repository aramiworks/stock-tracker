import { useSegments } from "expo-router";
import { useEffect } from "react";
import { getEfcvFromSegments } from "../sentry/get-efcv-from-route";
import { trackScreen } from "./analytics";

/**
 * Subscribes to Expo Router segments and emits a `screen_viewed` event with
 * EFCV tags whenever the route changes. Mount once at the root layout level,
 * inside the navigation tree (anywhere `useSegments()` works).
 *
 * Mirrors `<SentryEfcvTracker />` so analytics screens line up with Sentry
 * EFCV tags.
 */
export function AnalyticsScreenTracker(): null {
  const segments = useSegments();

  useEffect(() => {
    const { experience, flow, container } = getEfcvFromSegments(segments);
    void trackScreen(experience, flow, container);
  }, [segments]);

  return null;
}
