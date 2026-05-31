---
"@stock-tracker/config": patch
---

Add `subgraph-auth` to the Railway redeploy SERVICES list so the new auth subgraph (split out in INF-1246) gets redeployed by CI alongside the other backend services. Also clean up `subgraph-tracker` env vars to drop `DATABASE_URL` and `TRPC_AUTH_SERVICE_URL`, which it no longer reads after the split.
