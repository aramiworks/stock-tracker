---
"@stock-tracker/prisma": patch
---

Add sku_stock_state and parse_errors tables for scraper state tracking; add onDelete: SetNull to parse_errors.sku relation to prevent FK violations when deleting a SKU.
