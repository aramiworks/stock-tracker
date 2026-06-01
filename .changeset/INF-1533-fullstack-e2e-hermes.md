---
"@stock-tracker/mobile": patch
---

Rewrite the full-stack post-deploy e2e jest suite (`apps/integration-tests/full-stack/`) for the current Hermès schema. The old suite queried Cartier-era `me`, `dashboard.totalAccounts`, `createAccount`, `accounts` — all dropped during the Hermès pivot. Subgraph-tracker logs surfaced this as `Cannot query field "me" on type "Query"` and `Did you mean "createWatch"?` once INF-1390 unblocked backend reachability. Tests #4 and #5 (createWatch round-trip) skip with a clear message when develop's `catalogList` is empty — restored once INF-1551 seeds the dev catalog. Cleanup helper switched from delete-by-prefix on `tracker_accounts` to delete-by-id on `watches` (scoped to `auth_user_id` for safety).
