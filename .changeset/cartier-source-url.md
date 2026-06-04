---
"@stock-tracker/prisma": patch
"@stock-tracker/scraper": patch
---

Add a nullable `skus.source_url` so Cartier watches whose PDP URL isn't derivable from the reference code (Santos/Panthère/Ballon Bleu/Tank Américaine) can be polled. `SkuRef.url` and `CartierAdapter.buildUrl` use the stored URL when present, falling back to the Tank Must pattern; `pollCartier` selects and passes `source_url`. Seed expanded with representative non-Tank-Must watches.
