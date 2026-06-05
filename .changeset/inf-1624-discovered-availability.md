---
"@stock-tracker/scraper": patch
"@stock-tracker/prisma": patch
---

Add a Hermès discovered-products availability monitor: a scheduled job resolves each non-stale `discovered_products` bag's stock through the hardened read path and stores `in_stock`/`last_checked_at`/`last_changed_at` on the row, so "what's in stock now" is a DB query. Decoupled from the curated catalog and alert pipeline.
