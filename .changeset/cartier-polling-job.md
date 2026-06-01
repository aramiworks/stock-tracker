---
"@stock-tracker/scraper": patch
---

Wire Cartier into a scheduled pollCartier task: enumerate active Cartier SKUs, fetch + parse stock via the adapter (no proxy), and record state transitions. Make Fetcher.proxy optional so fingerprint-level brands fetch without a proxy. Drop-event ingest is gated behind the stubbed tRPC client until INF-1356 lands.
