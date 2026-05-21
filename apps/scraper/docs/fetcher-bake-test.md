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
#   npx playwright-core@1.47.2 install chromium  (matches playwright-extra's peer dep)
#   ln -sf node_modules/puppeteer-extra-plugin-stealth node_modules/stealth  (evasion resolution)
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

### Smoke (2026-05-21, this PR)

```
runId: smoke-2026-05-19
duration: ~10 min (4 rounds × 60s interval, browser latency extended rounds)
URLs: 10 (9 product pages + homepage)
proxy: Oxylabs residential, KR pool (pr.oxylabs.io:7777)
total requests: 80 (40 per fetcher)

- HttpFetcher (got-scraping + Chrome 131 TLS):
    homepage:       4/4 success (100%), status 200
    product pages:  0/36 success (0%), 35 blocked (403), 1 error
    overall:        10% success, 87.5% blocked, 2.5% error
    p50 latency:    3009ms
    p95 latency:    3912ms
    content/resp:   ~586KB (homepage only)
    est. cost:      $0.034

- BrowserFetcher (Playwright + stealth):
    homepage:       4/4 success (100%), status 200
    product pages:  0/36 success (0%), 36 blocked (403)
    overall:        10% success, 90% blocked, 0% error
    p50 latency:    8812ms
    p95 latency:    33701ms
    content/resp:   ~619KB (homepage only)
    est. cost:      $0.035

Notes:
  - BOTH fetchers are blocked on ALL product pages — Akamai returns 403 consistently.
  - Homepage passes for both (likely lighter bot protection on the landing page).
  - BrowserFetcher with Playwright stealth does NOT bypass Akamai on product pages.
  - BrowserFetcher is 3–9x slower with zero anti-bot benefit over HttpFetcher.
  - The 403 blocks are 100% consistent across all 4 rounds — not intermittent.
  - Neither TLS fingerprinting (got-scraping) nor headless browser + stealth
    is sufficient to pass Akamai Bot Manager on hermes.com/kr product pages.

Setup notes (for reproducing):
  - playwright-extra depends on playwright-core@1.47.2, not playwright@1.60.0.
    Must install chromium for the correct version: `npx playwright-core@1.47.2 install chromium`
  - puppeteer-extra-plugin-stealth resolves evasions as `stealth/evasions/*`,
    needs a symlink: `ln -sf node_modules/puppeteer-extra-plugin-stealth node_modules/stealth`
```

### Full bake (separate commit after merge)

```
runId: bake-YYYYMMDD
[fill in after the long run]
```

## Decision

**Smoke verdict: Neither fetcher can scrape product pages.**

Both HttpFetcher and BrowserFetcher achieve 0% success on product pages through Oxylabs residential proxies. Akamai Bot Manager on hermes.com/kr blocks all requests regardless of:

- TLS fingerprinting (Chrome 131 profile via got-scraping)
- Headless browser with stealth evasions (Playwright + puppeteer-extra-plugin-stealth)
- Korean locale/timezone/headers
- Oxylabs KR residential IP pool

**Recommendation:** HttpFetcher is the pragmatic default — same 0% product-page success as BrowserFetcher but 3–9x faster and cheaper. The real blocker is Akamai's server-side bot detection, not client fingerprinting.

**Next steps (requires architectural decision):**

1. **Evaluate Akamai solver services** (e.g., CapSolver, 2Captcha Akamai) — inject solved `_abck` cookie into HttpFetcher
2. **Evaluate Oxylabs Web Scraper API** — Oxylabs' managed headless rendering with built-in Akamai bypass ($2.2/1K requests)
3. **Evaluate Bright Data's Scraping Browser** — managed browser with fingerprint rotation
4. Full bake is moot until we solve the Akamai challenge — skip for now
