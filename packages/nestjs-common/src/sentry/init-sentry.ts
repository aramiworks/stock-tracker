import * as Sentry from "@sentry/node";

export interface InitSentryOptions {
  /** Sentry project name, e.g. "auth-service" — used for tags. */
  service: string;
  /**
   * Sentry DSN. Each service reads its own per-service env var
   * (e.g. `AUTH_SERVICE_SENTRY_DSN`, `TRACKER_SERVICE_SENTRY_DSN`) so that
   * services sharing a Doppler config don't cross-report errors. Init is a
   * no-op when undefined.
   */
  dsn: string | undefined;
  /** Defaults to `process.env.NODE_ENV`. */
  environment?: string;
  /** Defaults to 0.1 — same as the convention. */
  tracesSampleRate?: number;
}

/**
 * Initialise `@sentry/node` for a backend service.
 *
 * IMPORTANT: must be called from a separate `instrument.ts` file that is
 * imported FIRST in `main.ts`, before any NestJS / framework imports.
 * Sentry's auto-instrumentation hooks Node module loading and only sees
 * modules imported after `Sentry.init`.
 *
 * No-ops when the DSN is unset (local dev, tests).
 */
export function initSentry(options: InitSentryOptions): void {
  const { dsn } = options;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: options.environment ?? process.env["NODE_ENV"],
    tracesSampleRate: options.tracesSampleRate ?? 0.1,
    initialScope: {
      tags: { service: options.service },
    },
  });
}
