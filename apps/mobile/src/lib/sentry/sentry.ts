import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { getCurrentEfcv } from "./efcv-cache";

/**
 * Resolve the release identifier in the form `{version}+{build}`, matching
 * the convention used by `sentry-cli` source-map uploads via the
 * `@sentry/react-native/expo` plugin. Falls back to `version` alone if no
 * native build number is exposed at runtime.
 */
function resolveRelease(): string | undefined {
  const version = Constants.expoConfig?.version;
  if (!version) return undefined;
  const build =
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode?.toString();
  return build ? `${version}+${build}` : version;
}

function resolveDist(): string | undefined {
  return (
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode?.toString()
  );
}

/**
 * Initialise Sentry for the mobile app.
 *
 * No-ops when `EXPO_PUBLIC_SENTRY_DSN` is unset (e.g. local dev, tests). This
 * keeps the call safe to make unconditionally from the root layout.
 *
 * EFCV tags (`experience`, `flow`, `container`) are added to every event via
 * `beforeSend` from a cache populated by `<SentryEfcvTracker />`.
 *
 * Release/dist are derived from `Constants.expoConfig` so events line up with
 * the source maps the `@sentry/react-native/expo` plugin uploads. Environment
 * is derived from `EXPO_PUBLIC_APP_ENV` (local | develop | stage | master) so
 * events from each EAS channel are filterable in Sentry.
 */
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_APP_ENV ?? "local",
    release: resolveRelease(),
    dist: resolveDist(),
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
