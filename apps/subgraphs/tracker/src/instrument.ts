// MUST be imported before any other module in server.ts so Sentry's
// auto-instrumentation can hook Node's module loading. See:
// https://docs.sentry.io/platforms/javascript/guides/node/install/esm/
import * as Sentry from "@sentry/node";

const dsn = process.env["SUBGRAPH_TRACKER_SENTRY_DSN"];
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env["NODE_ENV"],
    tracesSampleRate: 0.1,
    initialScope: {
      tags: { service: "subgraph-tracker" },
    },
  });
}
