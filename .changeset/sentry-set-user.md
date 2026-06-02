---
"@stock-tracker/mobile": patch
---

Tag Sentry events and Session Replays with the authenticated user's stable id. `identifySentryUser` is called on session rehydration and on `SIGNED_IN`/token refresh; `resetSentryUser` clears the context on `SIGNED_OUT` so subsequent anonymous events aren't mis-attributed.
