---
"@stock-tracker/mobile": patch
---

Add `scripts/e2e-seed-catalog.mjs` — REST-based one-shot to seed the Hermès reference catalog (5 watchable_units + 9 skus across Birkin / Kelly / Lindy) into a deployed Supabase project. Sister to `scripts/e2e-seed.mjs`, but separate because catalog is reference data (run once per env) and uses REST instead of Prisma (the develop pooler credentials in 1Password are stale — tracked separately on INF-1551). Idempotent — re-running is safe. Verified by running against develop and confirming the previously-skipped full-stack e2e jest tests #4 + #5 now run for real (1.4s each).
