---
"@stock-tracker/mobile": patch
---

Hotfix the TypeScript regression introduced by PR #388 (INF-1414): drop the legacy `tracker-accounts-list/` family that still pushed to the deleted `/tracker/accounts/detail/[id]` route, and point the parked alerts/home dashboard `onSaPress` at the new flat `/tracker/watchlist` route. Swap the watchlist list + detail controllers from in-memory mocks to the protected `watchlist` / `watchlistDetail` GraphQL queries landed by INF-1415.
