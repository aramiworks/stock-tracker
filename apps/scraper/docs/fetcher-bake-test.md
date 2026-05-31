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

### WSA Parameter Probe (INF-1492, 2026-05-21)

After the INF-1413 smoke confirmed 0% product-page success through Oxylabs residential proxies,
we evaluated Oxylabs Web Scraper API (WSA) as a managed anti-bot alternative.
The team lead's manual curl confirmed the default WSA config (status 613 "faulted") on product pages.
A follow-up probe tested 4 variants against 3 product URLs + homepage.

```
probe date:  2026-05-21
endpoint:    https://realtime.oxylabs.io/v1/queries
URLs:        4 (3 product pages + homepage)
variants:    3 WSA + 1 Web Unblocker

v1 – render-chrome  (source=universal, render=html, user_agent_type=desktop_chrome, parse=false):
  homepage:       OK (200, 579KB)  ~16.5s
  product pages:  0/3 success — all 613 "faulted" (Oxylabs reports target unreachable)

v2 – session        (v1 + session_id="probe-kr-1" for sticky IP):
  homepage:       OK (200, 579KB)  ~10s
  product pages:  0/3 success — all 613 "faulted"

v3 – browser-wait   (v1 + browser_instructions: wait_for_element + scroll + wait 2s):
  homepage:       OK (200, 579KB)  ~14s
  product pages:  0/3 success — all 613 "faulted"

v4 – Web Unblocker  (unblock.oxylabs.io:60000 proxy, x-oxylabs-render: html):
  unable to test cleanly (undici HTTPS proxy setup issue); inconclusive

Notes:
  - 613 "faulted" = Oxylabs itself cannot reach the target — Akamai blocks at the
    network/IP level before WSA's rendering layer even runs.
  - Homepage always passes (lighter bot protection on landing page).
  - session_id, browser_instructions, and desktop_chrome UA make no difference —
    the block is at WSA's egress IP level, not client fingerprinting.
  - WSA homepage success ≠ product page success: different Akamai policy per path.
```

## Decision

**WSA verdict: Oxylabs cannot reach Hermès KR product pages at all.**

Summary across all tested approaches:

| Approach                                              | Product-page success |
| ----------------------------------------------------- | -------------------- |
| HttpFetcher (got-scraping + residential proxy)        | 0%                   |
| BrowserFetcher (Playwright + stealth + residential)   | 0%                   |
| Oxylabs WSA — default (source=universal, render=html) | 0% (613 faulted)     |
| Oxylabs WSA — desktop_chrome UA                       | 0% (613 faulted)     |
| Oxylabs WSA — desktop_chrome + session_id             | 0% (613 faulted)     |
| Oxylabs WSA — desktop_chrome + browser_instructions   | 0% (613 faulted)     |

Akamai blocks Oxylabs' egress IPs at the network/IP level on product pages regardless
of client fingerprinting, render mode, UA type, session stickiness, or browser scripting.
The homepage passes on all approaches — this is a per-path policy, not a general IP ban.

**Oxylabs (residential proxies + WSA) is exhausted. Pivot to Bright Data.**

**Next: Evaluate Bright Data Scraping Browser**

Bright Data uses a different residential IP pool and managed browser infrastructure.
Given that the Oxylabs block is IP-level (not fingerprint-level), a different provider
is the next logical test before falling back to Akamai solver services (CapSolver / 2Captcha).

1. **Bright Data Scraping Browser** — managed browser with fingerprint rotation, different IP pool
2. **Akamai solver service** (CapSolver / 2Captcha Akamai) — fallback if Bright Data also fails
