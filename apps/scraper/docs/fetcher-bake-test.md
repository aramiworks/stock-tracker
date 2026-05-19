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
# Standalone runner (no Trigger.dev needed):
DOPPLER_PROJECT=stock-tracker DOPPLER_CONFIG=develop doppler run -- \
  npx tsx apps/scraper/scripts/run-smoke.ts --runId=smoke-$(date +%Y-%m-%d)

# Prerequisites:
#   npm install                          (workspace deps)
#   npx playwright install chromium      (for BrowserFetcher)
#   Doppler develop config with DATABASE_URL + OXYLABS_* creds

# The script runs both fetchers against all URLs every 60s for 10 min,
# records results to fetcher_bake_results table, and prints analysis.
```

### Via Trigger.dev (for long bake)

```bash
# 1. Start with Doppler env
DOPPLER_PROJECT=stock-tracker DOPPLER_CONFIG=develop doppler run -- npm run dev -w @stock-tracker/scraper

# 2. Trigger the task (via Trigger.dev dashboard or CLI)
#    Pass a custom runId: { "runId": "bake-2026-05-20" }

# 3. After the run, analyze:
npm run analyze:bake -w @stock-tracker/scraper -- --runId=bake-2026-05-20
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

### Smoke (2026-05-19, this PR)

```
runId: smoke-2026-05-13
duration: ~10 min (8 rounds × 60s interval)
URLs: 10 (9 product pages + homepage)
proxy: Oxylabs residential, KR pool (pr.oxylabs.io:7777)

- HttpFetcher:
    homepage:       8/8 success (100%), status 200, avg ~2900ms
    product pages:  0/72 success (0%), 71 blocked (403), 1 error (404)
    overall:        10% success, 88.75% blocked, 1.25% error
    latency range:  1856–6499ms (typical ~2800–3500ms)
    content/resp:   ~633KB (homepage only)
    est. cost:      $0.07 (80 requests over 10 min)

- BrowserFetcher:
    all:            0/80 success — Chromium binary not installed
    (env setup issue, not a code defect — `npx playwright install chromium` needed)

Notes:
  - Akamai blocks ALL product page requests via HTTP (got-scraping + Chrome 131 TLS).
    Homepage passes because it likely has lighter bot protection.
  - got-scraping TLS fingerprinting alone is NOT sufficient for product pages.
  - BrowserFetcher needs a re-test with Chromium installed (see full bake).
  - The 403 responses are consistent across all 8 rounds — not intermittent.
  - One product URL (Picotin Lock 18 H056289CC37) returned 404 in round 3,
    suggesting the product may have been delisted mid-test.
```

### Full bake (separate commit after merge)

```
runId: bake-YYYYMMDD
[fill in after the long run]
```

## Decision

**Preliminary (smoke):** HttpFetcher alone cannot scrape product pages — Akamai blocks 100% of requests even with Chrome 131 TLS fingerprinting + Oxylabs residential proxies. BrowserFetcher is the likely winner but needs a re-test with Chromium properly installed.

**Next steps:**

1. Re-run smoke with Chromium installed to validate BrowserFetcher
2. If BrowserFetcher passes product pages, run full 24h bake to measure sustained success rate
3. Final decision after full bake data
