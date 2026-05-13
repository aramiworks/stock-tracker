---
"@stock-tracker/tracker-service": minor
"@stock-tracker/subgraph-tracker": minor
"@stock-tracker/validation": minor
---

INF-1415 — Add tracker subgraph watchlist queries + mutations (`watchlist`, `watchlistDetail`, `watchlistAdd`, `watchlistRemove`). New tRPC procedures expose unit-level watches grouped by `(brand, productLine)` with derived stock `state` and `lastRestockedAt`. All endpoints are JWT-protected; add/remove are idempotent. No schema change — uses the existing `watches` table with `sku_id = NULL` for unit-level watches.
