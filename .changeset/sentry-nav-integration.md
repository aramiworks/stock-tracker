---
"@stock-tracker/mobile": patch
---

Add Sentry's React Navigation integration so screen transitions produce performance transactions and navigation breadcrumbs. `enableTimeToInitialDisplay` is on. The root layout registers the navigation container ref on mount.
