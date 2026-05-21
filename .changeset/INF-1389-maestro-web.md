---
"@stock-tracker/mobile": patch
---

Migrate Maestro e2e-frontend CI from native (`appId:`) to web (`url:`) driver. Replaces `appId: so.arami.stocktracker.app` with `url: ${MAESTRO_APP_URL}` across `config.yaml` and all flow YAMLs (no emulator/Chromedriver needed — Maestro 2.5.1 auto-downloads managed Chromium). Drops the Xvfb step from `e2e.yml`, pins `MAESTRO_VERSION=2.5.1`, and removes the no-op `e2eToken` launchApp argument from `helpers/launch-authenticated.yaml` (web auth uses localStorage injection via `scripts/e2e-inject-session.mjs`).
