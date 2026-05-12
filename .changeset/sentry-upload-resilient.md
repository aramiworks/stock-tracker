---
"@stock-tracker/auth-service": patch
---

Make Sentry source map upload non-blocking and skip set_commits/finalize so transient Sentry errors don't fail the Backend Docker workflow and block deploys.
