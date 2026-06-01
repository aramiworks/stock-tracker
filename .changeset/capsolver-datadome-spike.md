---
"@stock-tracker/scraper": patch
---

Spike INF-1507: identify Hermès KR anti-bot as DataDome + Cloudflare (not Akamai), validate a CapSolver DataDome solve end-to-end, and add a `CapSolverDatadomeFetcher` that detects the 403 interstitial and solves it on the same sticky exit IP. Bake test shows plain HTTP is reliably clean on live product URLs, with intermittent IP-bound interstitials the solver rescues.
