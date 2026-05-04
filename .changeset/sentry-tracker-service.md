---
"@stock-tracker/tracker-service": minor
"@stock-tracker/auth-service": patch
"@stock-tracker/nestjs-common": minor
---

Add Sentry error tracking to tracker-service via shared `@stock-tracker/nestjs-common` Sentry module. Errors thrown from tRPC procedures are captured with EFCV tags (experience/flow/container) derived from the procedure path.

`initSentry({ dsn })` is now required (removed implicit `process.env.SENTRY_DSN` fallback) so each service reads its own per-service DSN env var (`AUTH_SERVICE_SENTRY_DSN`, `TRACKER_SERVICE_SENTRY_DSN`) and services sharing a Doppler config can't cross-report errors.
