---
"@stock-tracker/scraper": patch
---

Wire the real tRPC ingest client: `createIngestClient` now calls tracker-service's `tracker.ingest.dropEvent.upsert` over httpBatchLink + superjson, authenticating with the `X-Service-Token` header. `pollCartierTask` passes it (when `TRACKER_INGEST_URL` + `TRACKER_INGEST_SERVICE_TOKEN` are set), so a Cartier out→in transition now creates drop events and alerts; without the env it records + logs only.
