import { useSegments } from "expo-router";
import { useEffect } from "react";
import { setCurrentEfcv } from "./efcv-cache";
import { getEfcvFromSegments } from "./get-efcv-from-route";

/**
 * Subscribes to Expo Router segments and writes the latest EFCV tags into the
 * module-level cache that Sentry's `beforeSend` reads. Mount once at the root
 * layout level, inside the navigation tree (anywhere `useSegments()` works).
 */
export function SentryEfcvTracker(): null {
  const segments = useSegments();

  useEffect(() => {
    setCurrentEfcv(getEfcvFromSegments(segments));
  }, [segments]);

  return null;
}
