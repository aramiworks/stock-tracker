---
"@stock-tracker/mobile": minor
---

Add `tracker/catalog/browse` container — Shengsho-style product line grouping with per-row + master "All products" checkboxes. Wires up against the real GraphQL `catalogList` query (proxying tRPC `catalog.list` from INF-1393), with Suspense + ErrorBoundary for loading/error states. Bottom nav is Shengsho-strict (Watchlist → History, 2 tabs only); catalog is reached via a `+ 추가` entry point in the Watchlist header.
