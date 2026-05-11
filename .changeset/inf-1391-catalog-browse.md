---
"@stock-tracker/mobile": minor
---

Add `tracker/catalog/browse` container — Shengsho-style product line grouping with per-row + master "All products" checkboxes. Wires up against mock data mirroring the seeded `watchable_units` (29 Hermès units across 12 product lines + 4 Cartier Tank Must SKUs); will swap to the real tRPC `catalog.list` query once INF-1393 lands. Bottom nav is rebuilt to Catalog → Watchlist → History (no Alerts) per the new Shengsho UX.
