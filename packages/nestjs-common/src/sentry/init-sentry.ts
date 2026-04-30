import * as Sentry from "@sentry/node";

export interface InitSentryOptions {
  /** Sentry project name, e.g. "stock-tracker-auth-service" — used for tags. */
  service: string;
  /** Defaults to `process.env.SENTRY_DSN`; init is a no-op when unset. */
  dsn?: string;
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
  const dsn = options.dsn ?? process.env["SENTRY_DSN"];
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
