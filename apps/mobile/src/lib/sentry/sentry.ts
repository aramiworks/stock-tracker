import * as Sentry from "@sentry/react-native";
import { getCurrentEfcv } from "./efcv-cache";

let navigationIntegration: ReturnType<
  typeof Sentry.reactNavigationIntegration
> | null = null;

/**
 * Initialise Sentry for the mobile app.
 *
 * No-ops when `EXPO_PUBLIC_SENTRY_DSN` is unset (e.g. local dev, tests). This
 * keeps the call safe to make unconditionally from the root layout.
 *
 * EFCV tags (`experience`, `flow`, `container`) are added to every event via
 * `beforeSend` from a cache populated by `<SentryEfcvTracker />`.
 *
 * The React Navigation integration is created here so screen transitions are
 * captured as performance transactions and breadcrumbs; the root layout must
 * call `registerSentryNavigationContainer` once the navigation ref mounts.
 */
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  navigationIntegration = Sentry.reactNavigationIntegration({
    enableTimeToInitialDisplay: true,
  });

  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.mobileReplayIntegration(), navigationIntegration],
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

/**
 * Register the navigation container ref with the Sentry React Navigation
 * integration. Safe to call before `initSentry` (no-ops in that case) and
 * idempotent across re-renders of the root layout.
 */
export function registerSentryNavigationContainer(ref: unknown): void {
  if (navigationIntegration) {
    navigationIntegration.registerNavigationContainer(ref);
  }
}
