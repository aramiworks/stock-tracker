---
"@stock-tracker/scraper": minor
"@stock-tracker/prisma": patch
---

Add scraper observability: parse-error reporter (persists to `parse_errors` and emits structured logs), Better Stack metrics (reuses `packages/config` Pino + Logtail), and Slack pager that fires once per SKU after 5 consecutive failures with a 6h cooldown. New `sku_stock_state.last_paged_at` column drives the cooldown dedupe.

New env: `BETTER_STACK_TOKEN`, `BETTER_STACK_INGEST_HOST`, `SLACK_PAGER_WEBHOOK_URL`, `SLACK_PAGE_FAILURE_THRESHOLD`.
