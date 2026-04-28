import * as Sentry from "@sentry/react-native";
import { getCurrentEfcv } from "./efcv-cache";

/**
 * Initialise Sentry for the mobile app.
 *
 * No-ops when `EXPO_PUBLIC_SENTRY_DSN` is unset (e.g. local dev, tests). This
 * keeps the call safe to make unconditionally from the root layout.
 *
 * EFCV tags (`experience`, `flow`, `container`) are added to every event via
 * `beforeSend` from a cache populated by `<SentryEfcvTracker />`.
 */
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.mobileReplayIntegration()],
    beforeSend(event) {
      try {
        const efcv = getCurrentEfcv();
        event.tags = { ...event.tags, ...efcv };
      } catch {
        // beforeSend must never throw — drop EFCV tags rather than the event.
      }
      return event;
    },
  });
}
