# Fetcher Bake Test (INF-1360)

## Why

We need to pick HttpFetcher (got-scraping + TLS fingerprinting) or BrowserFetcher (Playwright + stealth) as the default for scraping hermes.com/kr through Akamai Bot Manager.

HttpFetcher is fast and cheap (~50KB/request). BrowserFetcher is ~10× heavier (full Chromium render) but may survive Akamai's JS challenges better. This test produces real data to make the call.

## How it works

- **HttpFetcher**: `got-scraping` with Chrome 131+ TLS profile, Korean headers, Oxylabs residential proxy, 800–2500ms jitter.
- **BrowserFetcher**: Playwright + `puppeteer-extra-plugin-stealth`, fresh Chromium context per request, Korean locale/timezone, `networkidle` wait.
- **Harness**: Trigger.dev task `bake-test-fetchers` runs both fetchers against 10 curated Hermès KR product URLs, records results to `fetcher_bake_results` table via Prisma.

## Run

### Smoke (~10 minutes)

```bash
# 1. Start with Doppler env
DOPPLER_PROJECT=stock-tracker DOPPLER_CONFIG=develop doppler run -- npm run dev -w @stock-tracker/scraper

# 2. Trigger the task (via Trigger.dev dashboard or CLI)
#    Pass a custom runId: { "runId": "smoke-2026-05-12" }

# 3. After ~10 minutes, analyze:
npm run analyze:bake -w @stock-tracker/scraper -- --runId=smoke-2026-05-12
```

### Full bake (24–48h)

```bash
# Same as smoke, but let it run for 24–48h with a different runId:
# { "runId": "bake-2026-05-13" }

# Schedule: set up a cron trigger for bake-test-fetchers at */1 * * * *
# Each invocation processes all 10 URLs with both fetchers (~20 requests/min)
```

## Decision criteria

1. **Success rate ≥ 95%** over the window → wins on success
2. If both ≥ 95%: pick **lower p95 latency**
3. If still tied: pick **lower cost** (bytes-per-fetch × $15/GB Oxylabs residential)
4. BrowserFetcher MUST justify its ~10× cost overhead with materially higher success rate

## Results

### Smoke (this PR)

> TODO — run the smoke and fill in real numbers.

```
runId: smoke-YYYYMMDD-HHMM
- HttpFetcher:    success X%, p50 Yms, p95 Zms, blocked W%
- BrowserFetcher: success X%, p50 Yms, p95 Zms, blocked W%
Notes: [observations]
```

### Full bake (separate commit after merge)

```
runId: bake-YYYYMMDD
[fill in after the long run]
```

## Decision

TBD after full bake.
