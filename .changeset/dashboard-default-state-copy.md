---
"@stock-tracker/mobile": patch
---

Add missing `dashboard.errorState` and `dashboard.emptyState` default copy to `ko/tracker.json`. The shared `TrackerErrorStateView` / `TrackerEmptyStateView` fall back to these keys when no `title`/`subtitle` props are passed (e.g. the account home error state), so without them those states rendered raw i18n key paths.
