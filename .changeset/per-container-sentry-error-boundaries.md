---
"@stock-tracker/mobile": patch
---

Add per-Container Sentry error boundaries. Render errors inside any Container are now reported to Sentry with EFCV tags and the user sees the Container's error state instead of an app-wide unmount.
