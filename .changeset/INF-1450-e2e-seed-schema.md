---
"@stock-tracker/mobile": patch
---

Rewrite `scripts/e2e-seed.mjs` to match the current Hermès schema. The script previously seeded into deleted Cartier-era tables (`tracker_accounts`, `tracker_purchases`) and failed with PGRST205 once Maestro started actually running (INF-1389). It now just upserts the e2e user's `public.auth_users` row — catalog/watches seeding for authenticated flows is deferred until backend reachability lands (INF-1390) and flow assertions are aligned with `seed-dev.ts` (INF-1496). Removes the `continue-on-error: true` band-aid from the inject + seed steps in `e2e.yml`.
