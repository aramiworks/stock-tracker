---
"@stock-tracker/mobile": patch
---

Migrate tracker-history-browse to TopAppBar from `@aramiworks/ui` (Phase 3 follow-up to INF-1111/INF-1121/INF-1123). Replaces the ad-hoc StatusBar/AppBar/Text construction with a single `TopAppBar type="small"` — title-only, no back button or trailing actions.
