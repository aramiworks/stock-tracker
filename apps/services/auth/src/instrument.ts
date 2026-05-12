// MUST be imported before any other module in main.ts so Sentry's
// auto-instrumentation can hook Node's module loading. See:
// https://docs.sentry.io/platforms/javascript/guides/node/install/esm/
import { initSentry } from "@stock-tracker/nestjs-common";

initSentry({
  service: "auth-service",
  dsn: process.env["AUTH_SERVICE_SENTRY_DSN"],
});
