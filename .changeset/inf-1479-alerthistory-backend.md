---
"@stock-tracker/tracker-service": minor
"@stock-tracker/subgraph-tracker": minor
"@stock-tracker/validation": minor
---

INF-1479 — Add tracker subgraph `alertHistory(limit, cursor): AlertHistoryPage!` query. New JWT-protected tRPC procedure `tracker.alertHistory.list({ limit, cursor })` returns past drop events scoped to the user's watchlist (unit-level OR sku-level watches), ordered by `detected_at DESC` with timestamp-based cursor pagination. Each row exposes `{ id, brand, productLine, modelName, skuDescriptor, kind, detectedAt }`. `kind` is typed `"restocked" | "soldOut"` for forward compatibility — today the controller always emits `"restocked"` because `drop_events` has no kind discriminator. No schema change.
