---
"@stock-tracker/prisma": patch
---

Add `onDelete: SetNull` to `parse_errors.sku` relation to prevent FK constraint violations when deleting a SKU that has associated parse error rows.
