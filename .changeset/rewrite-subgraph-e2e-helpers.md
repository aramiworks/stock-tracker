---
"@stock-tracker/subgraph-tracker": patch
"@stock-tracker/auth-service": patch
---

Rewrite subgraph e2e helpers to spawn auth-service as a child process, mirroring the tracker-service pattern. Drops the inline tRPC server backed by `@stock-tracker/api`. Generalizes `spawnTrackerTestServer` into a reusable `spawnNestTestServer` helper.
