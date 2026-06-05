---
"@stock-tracker/scraper": patch
"@stock-tracker/prisma": patch
---

Add a daily Hermès live-URL discovery job: sweep the women's-bags category, record each live product in a new `discovered_products` freshness table (idempotent on article code), and mark entries stale after a 14-day TTL.
