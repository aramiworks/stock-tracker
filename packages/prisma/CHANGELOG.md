# @stock-tracker/prisma

## 0.1.0

### Minor Changes

- [#446](https://github.com/aramiworks/stock-tracker/pull/446) [`6591e72`](https://github.com/aramiworks/stock-tracker/commit/6591e722e32b0ffff562371f250e795aa308ce77) Thanks [@cheunjm](https://github.com/cheunjm)! - Add push_devices table and registerPushDevice/unregisterPushDevice mutations so a device's Expo push token can be associated with the current user — the foundation for restock push notifications.

- [#365](https://github.com/aramiworks/stock-tracker/pull/365) [`eedeffa`](https://github.com/aramiworks/stock-tracker/commit/eedeffae9416f5741e1105fb8c37abba60523b05) Thanks [@cheunjm](https://github.com/cheunjm)! - Add cursor-based pagination to catalog browse API and MVP catalog seed (Hermes bags + Cartier watches).

- [#351](https://github.com/aramiworks/stock-tracker/pull/351) [`2a355f2`](https://github.com/aramiworks/stock-tracker/commit/2a355f24df5e693b1a92465e37995d2bfd23fc14) Thanks [@cheunjm](https://github.com/cheunjm)! - Pivot backend data model from Cartier purchase tracker to Hermes Korea restock alert app.

### Patch Changes

- [#344](https://github.com/aramiworks/stock-tracker/pull/344) [`bdb9196`](https://github.com/aramiworks/stock-tracker/commit/bdb9196d0a67ac409a4f8dbca6ee0b6ec89a2a44) Thanks [@cheunjm](https://github.com/cheunjm)! - Add forward migration `20260504000000_align_tracker_accounts_fk` that brings deployed databases in sync with INF-1235. INF-1235 changed the `tracker_accounts.auth_user_id` FK target from `auth_users.id` to `auth_users.supabase_id` by editing the init migration in place, so the deployed develop DB never received the ALTER. The migration is idempotent — it inspects `pg_constraint` and runs the FK swap + row backfill only when the FK still references `auth_users.id`. Re-enables full-stack e2e tests 4 and 5 (createAccount round-trip + ownership check) that were skipped pending this fix.

- [#428](https://github.com/aramiworks/stock-tracker/pull/428) [`fb245a9`](https://github.com/aramiworks/stock-tracker/commit/fb245a952cd1b3934fba4e6864faadd0b3b066de) Thanks [@cheunjm](https://github.com/cheunjm)! - Add a nullable `skus.source_url` so Cartier watches whose PDP URL isn't derivable from the reference code (Santos/Panthère/Ballon Bleu/Tank Américaine) can be polled. `SkuRef.url` and `CartierAdapter.buildUrl` use the stored URL when present, falling back to the Tank Must pattern; `pollCartier` selects and passes `source_url`. Seed expanded with representative non-Tank-Must watches.

- [#360](https://github.com/aramiworks/stock-tracker/pull/360) [`58e5a43`](https://github.com/aramiworks/stock-tracker/commit/58e5a4376106441ff92b6ab6e6e42afdc52f2161) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix seed-dev to use supabase_id for tracker_accounts auth_user_id after FK column change.

- [#327](https://github.com/aramiworks/stock-tracker/pull/327) [`82e9097`](https://github.com/aramiworks/stock-tracker/commit/82e9097c0b892a7f09c28af01d59dd5f5440344d) Thanks [@cheunjm](https://github.com/cheunjm)! - Change tracker_accounts FK to reference auth_users.supabase_id so auth_user_id (Supabase JWT sub) resolves correctly.

- [#445](https://github.com/aramiworks/stock-tracker/pull/445) [`ea7ea25`](https://github.com/aramiworks/stock-tracker/commit/ea7ea2591e3be6e276ce1e43b209f6449c3e2862) Thanks [@cheunjm](https://github.com/cheunjm)! - Add a daily Hermès live-URL discovery job: sweep the women's-bags category, record each live product in a new `discovered_products` freshness table (idempotent on article code), and mark entries stale after a 14-day TTL.

- [#448](https://github.com/aramiworks/stock-tracker/pull/448) [`e14831f`](https://github.com/aramiworks/stock-tracker/commit/e14831f288a0ddaba7de37f2fdee86236c5c0683) Thanks [@cheunjm](https://github.com/cheunjm)! - Add a Hermès discovered-products availability monitor: a scheduled job resolves each non-stale `discovered_products` bag's stock through the hardened read path and stores `in_stock`/`last_checked_at`/`last_changed_at` on the row, so "what's in stock now" is a DB query. Decoupled from the curated catalog and alert pipeline.

- [#384](https://github.com/aramiworks/stock-tracker/pull/384) [`ff31b6b`](https://github.com/aramiworks/stock-tracker/commit/ff31b6b45f4fe89fef624029b379c5daaaff9250) Thanks [@cheunjm](https://github.com/cheunjm)! - Add tracker.ingest.dropEvent.upsert tRPC mutation with serviceProcedure auth and idempotent drop event processing.

- [#363](https://github.com/aramiworks/stock-tracker/pull/363) [`f3bbdbb`](https://github.com/aramiworks/stock-tracker/commit/f3bbdbb472b1fbbc831e661266cf4eb9a3a48a99) Thanks [@cheunjm](https://github.com/cheunjm)! - Rewrite seed-dev and seed-e2e for new watchlist/alerts schema (watchable_units, skus, watches, drop_events, alerts).

- [#439](https://github.com/aramiworks/stock-tracker/pull/439) [`fc5d9fe`](https://github.com/aramiworks/stock-tracker/commit/fc5d9feaa7013f9a3ef2a3879af156e8f331337f) Thanks [@cheunjm](https://github.com/cheunjm)! - Add scraper observability: parse-error reporter (persists to `parse_errors` and emits structured logs), Better Stack metrics (reuses `packages/config` Pino + Logtail), and Slack pager that fires once per SKU after 5 consecutive failures with a 6h cooldown. New `sku_stock_state.last_paged_at` column drives the cooldown dedupe.

  New env: `BETTER_STACK_TOKEN`, `BETTER_STACK_INGEST_HOST`, `SLACK_PAGER_WEBHOOK_URL`, `SLACK_PAGE_FAILURE_THRESHOLD`.

- [#370](https://github.com/aramiworks/stock-tracker/pull/370) [`2099259`](https://github.com/aramiworks/stock-tracker/commit/2099259c80474a80ab515889ed4ba7732b799834) Thanks [@cheunjm](https://github.com/cheunjm)! - Add sku_stock_state and parse_errors tables for scraper state tracking; add onDelete: SetNull to parse_errors.sku relation to prevent FK violations when deleting a SKU.
