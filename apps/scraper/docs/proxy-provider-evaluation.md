# Residential Proxy Provider Evaluation

**Issue:** [INF-1357](https://linear.app/jaemincheun/issue/INF-1357/infra-scraper-provision-residential-proxy-provider-doppler-keys)
**Date:** 2026-05-07
**Context:** Hermès KR restock scraper needs residential proxies to defeat Akamai Bot Manager on `hermes.com/kr`. ~100 SKUs polled every 60s, ~50KB per fetch.

## Scale Estimate (MVP)

| Metric | Value |
|--------|-------|
| SKUs | ~100 |
| Poll interval | 60s |
| Avg response size | ~50KB |
| Monthly requests | ~4.3M (100 × 1440 × 30) |
| Monthly bandwidth | **~7 GB/month** |
| Growth buffer (2×) | ~14 GB/month |

## Provider Comparison

| Criteria | Bright Data | Oxylabs | IPRoyal | Decodo (Smartproxy) |
|----------|-------------|---------|---------|---------------------|
| **Global IP pool** | 400M+ | 175M+ | 32M+ | 115M+ |
| **KR IP pool** | Not disclosed (195 countries) | **1.3M+ KR IPs** (disclosed) | Not disclosed | Not disclosed |
| **Price at ~7 GB/mo** | $4.00/GB PAYG = **$28/mo** | $6.00/GB (5 GB Starter) = **$30/mo** | $7.00/GB (1 GB tier) = **$49/mo** | $3.75/GB (3 GB tier) = **$26/mo** |
| **Price at ~14 GB/mo** | $4.00/GB PAYG = **$56/mo** | $5.00/GB (20 GB Basic) = **$70/mo** | $5.25/GB (10 GB tier) = **$74/mo** | $3.50/GB (10 GB tier) = **$49/mo** |
| **Sticky sessions** | Up to 60 min (custom plan for longer) | Supported (duration not published) | **Up to 7 days** | Up to 30 min (up to 24h on higher tiers) |
| **TLS fingerprint** | Web Unlocker handles automatically; Scraping Browser has randomized fingerprints | AI-powered routing; highest documented Akamai success rates | Web Unblocker (AI-managed fingerprints) | Basic residential — no managed unlocker |
| **Country targeting** | Country/city/ASN | Country/city/ZIP/ASN | Country/state/city | Country/city/ZIP |
| **Free trial** | 7-day, $2 credit (business verification required) | 7-day (contact sales) | **No free trial** | **3-day, 100 MB** |
| **Traffic expiry** | Monthly (unused expires) | Monthly (unused expires) | **Never expires** | Monthly (unused expires) |
| **Anti-bot track record** | Industry leader — Web Unlocker, CAPTCHA solving | Highest documented Akamai/Cloudflare success rates | Smaller pool — less battle-tested against Akamai | Mid-tier — adequate for simpler protections |

## Analysis

### Why Oxylabs is the pick

1. **Largest disclosed KR pool (1.3M+ IPs).** For a scraper hitting `hermes.com/kr` at 60s cadence, Korean IP diversity is the single most important factor. More unique KR IPs = longer before Akamai flags a rotation pattern. No other provider discloses KR-specific numbers.

2. **Best documented Akamai success rate.** Multiple independent reviews cite Oxylabs as having the highest success rate against Akamai Bot Manager specifically — the exact anti-bot system protecting Hermès. Bright Data's Web Unlocker is comparable but is a separate, higher-priced product ($2–4/CPM on top of proxy cost).

3. **Competitive pricing at MVP scale.** At 7 GB/month, Oxylabs Starter ($30/mo) is within $2–4 of Bright Data PAYG ($28/mo) and Decodo ($26/mo). The KR pool advantage justifies the small premium.

4. **Sticky sessions.** Essential for maintaining a browsing session across page navigations (product page → add to cart flow) to look human. Oxylabs supports this natively.

5. **Free trial available.** Contact sales for a 7-day trial — sufficient for the INF-1360 bake-test spike without committing money.

### Why not the others

- **Bright Data:** Close second. Largest global pool and Web Unlocker is best-in-class, but Web Unlocker is priced separately (per-CPM, not per-GB) which complicates cost estimation. The 7-day trial requires business verification + video call. If Oxylabs trial proves insufficient, Bright Data is the fallback.

- **IPRoyal:** Cheapest at high volume ($1.75/GB at 500 GB+) and 7-day sticky sessions are attractive, but the 32M pool is 5× smaller than Oxylabs. No free trial. Non-expiring traffic is nice but irrelevant at MVP scale. Higher risk of KR IP exhaustion at 60s polling cadence.

- **Decodo (Smartproxy):** Cheapest at MVP scale ($26/mo), but 30-min sticky session cap is tight for extended browsing sessions. No disclosed KR pool size. Less battle-tested against Akamai specifically. 3-day / 100 MB trial is too small for a meaningful bake-test.

## Recommendation

**Oxylabs Residential Proxies** — Starter plan (5 GB @ $6/GB = $30/mo), upgrade to Basic (20 GB @ $5/GB) when we scale past MVP.

### Action required from Jace

1. **Sign up for Oxylabs free trial:** Contact sales at https://oxylabs.io/products/free-trial-proxies or email support@oxylabs.io requesting a 7-day residential proxy trial with KR targeting. Mention scraping use case.
2. After trial provisioning, share these credentials (save to 1Password vault `Openclaw` first):
   - Proxy host (e.g., `pr.oxylabs.io`)
   - Proxy port (typically `7777`)
   - Username
   - Password
3. Infra will then set the Doppler keys and unblock [INF-1360](https://linear.app/jaemincheun/issue/INF-1360) (bake-test spike).

### Fallback plan

If Oxylabs trial shows <90% success rate against Hermès KR during the INF-1360 bake-test:
1. Try Bright Data PAYG ($4/GB) with Web Unlocker
2. If both fail with plain HTTP, escalate to Browser Fetcher path (Playwright + stealth) which has higher bandwidth cost but better anti-bot evasion
