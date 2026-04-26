---
"@stock-tracker/mobile": patch
---

Migrate tracker-dashboard-home to TopAppBar from `@aramiworks/ui` (anchor PR for Phase 3). Bumps `@aramiworks/ui` from `^0.7.0` to `^0.9.0` to pull in the `useSafeAreaInsets` integration and `trailingContent` slot. Removes hand-rolled statusBar/appBar styles in favour of the shared organism.
