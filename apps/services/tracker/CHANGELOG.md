# @stock-tracker/tracker-service

## 0.1.0

### Minor Changes

- [#446](https://github.com/aramiworks/stock-tracker/pull/446) [`6591e72`](https://github.com/aramiworks/stock-tracker/commit/6591e722e32b0ffff562371f250e795aa308ce77) Thanks [@cheunjm](https://github.com/cheunjm)! - Add push_devices table and registerPushDevice/unregisterPushDevice mutations so a device's Expo push token can be associated with the current user — the foundation for restock push notifications.

- [#263](https://github.com/aramiworks/stock-tracker/pull/263) [`88a67c8`](https://github.com/aramiworks/stock-tracker/commit/88a67c8394162ddb8801d82d403dc75ac31416dd) Thanks [@cheunjm](https://github.com/cheunjm)! - Add tracker NestJS + tRPC microservice (Phase 2 of NestJS migration).

- [#365](https://github.com/aramiworks/stock-tracker/pull/365) [`eedeffa`](https://github.com/aramiworks/stock-tracker/commit/eedeffae9416f5741e1105fb8c37abba60523b05) Thanks [@cheunjm](https://github.com/cheunjm)! - Add cursor-based pagination to catalog browse API and MVP catalog seed (Hermes bags + Cartier watches).

- [#351](https://github.com/aramiworks/stock-tracker/pull/351) [`2a355f2`](https://github.com/aramiworks/stock-tracker/commit/2a355f24df5e693b1a92465e37995d2bfd23fc14) Thanks [@cheunjm](https://github.com/cheunjm)! - Pivot backend data model from Cartier purchase tracker to Hermes Korea restock alert app.

- [#380](https://github.com/aramiworks/stock-tracker/pull/380) [`22bec75`](https://github.com/aramiworks/stock-tracker/commit/22bec755dd4be862132ad59be13959cd245c6c12) Thanks [@cheunjm](https://github.com/cheunjm)! - Add anonymous-readable `tracker.catalog.list` tRPC procedure and `catalogList` GraphQL query returning active watchable_units grouped by (brand, productLine) for the Shengsho-style catalog browse UI.

- [#387](https://github.com/aramiworks/stock-tracker/pull/387) [`464a152`](https://github.com/aramiworks/stock-tracker/commit/464a1529ecdd8934a818c3841c47d4a509999540) Thanks [@cheunjm](https://github.com/cheunjm)! - INF-1415 — Add tracker subgraph watchlist queries + mutations (`watchlist`, `watchlistDetail`, `watchlistAdd`, `watchlistRemove`). New tRPC procedures expose unit-level watches grouped by `(brand, productLine)` with derived stock `state` and `lastRestockedAt`. All endpoints are JWT-protected; add/remove are idempotent. No schema change — uses the existing `watches` table with `sku_id = NULL` for unit-level watches.

- [#395](https://github.com/aramiworks/stock-tracker/pull/395) [`59723a8`](https://github.com/aramiworks/stock-tracker/commit/59723a81a52679379cd743d750f972686a38c679) Thanks [@cheunjm](https://github.com/cheunjm)! - INF-1479 — Add tracker subgraph `alertHistory(limit, cursor): AlertHistoryPage!` query. New JWT-protected tRPC procedure `tracker.alertHistory.list({ limit, cursor })` returns past drop events scoped to the user's watchlist (unit-level OR sku-level watches), ordered by `detected_at DESC` with timestamp-based cursor pagination. Each row exposes `{ id, brand, productLine, modelName, skuDescriptor, kind, detectedAt }`. `kind` is typed `"restocked" | "soldOut"` for forward compatibility — today the controller always emits `"restocked"` because `drop_events` has no kind discriminator. No schema change.

- [#337](https://github.com/aramiworks/stock-tracker/pull/337) [`29f9da1`](https://github.com/aramiworks/stock-tracker/commit/29f9da1e109612a6cac1aecd8961840d74cc5979) Thanks [@cheunjm](https://github.com/cheunjm)! - Add Sentry error tracking to tracker-service via shared `@stock-tracker/nestjs-common` Sentry module. Errors thrown from tRPC procedures are captured with EFCV tags (experience/flow/container) derived from the procedure path.

  `initSentry({ dsn })` is now required (removed implicit `process.env.SENTRY_DSN` fallback) so each service reads its own per-service DSN env var (`AUTH_SERVICE_SENTRY_DSN`, `TRACKER_SERVICE_SENTRY_DSN`) and services sharing a Doppler config can't cross-report errors.

### Patch Changes

- [#288](https://github.com/aramiworks/stock-tracker/pull/288) [`127013e`](https://github.com/aramiworks/stock-tracker/commit/127013e46b53232a719545d5786d991b8457ec03) Thanks [@cheunjm](https://github.com/cheunjm)! - Add auth-service (port 4030) and tracker-service (port 4020) to GHCR build matrix and Railway service config. Parameterize `infra/docker/node-service.Dockerfile` with `ARG ENTRYPOINT_FILE` so NestJS services run `dist/main.js`. Additive — `apps/api` remains in place; subgraph traffic still points at it.

- [#293](https://github.com/aramiworks/stock-tracker/pull/293) [`6ccd92f`](https://github.com/aramiworks/stock-tracker/commit/6ccd92fabf98060087f04b16233000cfe1ae8980) Thanks [@cheunjm](https://github.com/cheunjm)! - Cut subgraph-tracker over to auth-service (port 4030) and tracker-service (port 4020) on Railway. Subgraph now reads `TRPC_AUTH_SERVICE_URL` + `TRPC_TRACKER_SERVICE_URL` instead of the legacy `TRPC_SERVICE_URL` (apps/api). Adds `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` to tracker-service envVars (required by `baseEnvSchema`). Doppler develop/stage/master synced with the new env vars.

- [#384](https://github.com/aramiworks/stock-tracker/pull/384) [`ff31b6b`](https://github.com/aramiworks/stock-tracker/commit/ff31b6b45f4fe89fef624029b379c5daaaff9250) Thanks [@cheunjm](https://github.com/cheunjm)! - Add tracker.ingest.dropEvent.upsert tRPC mutation with serviceProcedure auth and idempotent drop event processing.

- [#390](https://github.com/aramiworks/stock-tracker/pull/390) [`8f4fbe4`](https://github.com/aramiworks/stock-tracker/commit/8f4fbe41332848aa1f01099efd3867be586c3403) Thanks [@cheunjm](https://github.com/cheunjm)! - Upload tracker-service Sentry source maps in Backend Docker workflow alongside auth-service.

- [#282](https://github.com/aramiworks/stock-tracker/pull/282) [`00a291b`](https://github.com/aramiworks/stock-tracker/commit/00a291b16c2167676cddcbcd105933342ca04e28) Thanks [@cheunjm](https://github.com/cheunjm)! - Switch dev runner from tsx to node --loader ts-node/esm to fix NestJS constructor DI (emitDecoratorMetadata). Fix apiHandle leak when spawnTrackerTestServer fails in test helpers; suppress deprecated --loader ExperimentalWarning and remove unused tsx devDependency.

- Updated dependencies [[`6591e72`](https://github.com/aramiworks/stock-tracker/commit/6591e722e32b0ffff562371f250e795aa308ce77), [`41c37d0`](https://github.com/aramiworks/stock-tracker/commit/41c37d069f9a10b9a3655da24b2f5b1b2c2da995), [`70c57c6`](https://github.com/aramiworks/stock-tracker/commit/70c57c6dc15cd837f03c6b79065bf5cd2d93013a), [`eedeffa`](https://github.com/aramiworks/stock-tracker/commit/eedeffae9416f5741e1105fb8c37abba60523b05), [`9563de7`](https://github.com/aramiworks/stock-tracker/commit/9563de7eb8b505510c4292fc53eb503843247e5d), [`2a355f2`](https://github.com/aramiworks/stock-tracker/commit/2a355f24df5e693b1a92465e37995d2bfd23fc14), [`22bec75`](https://github.com/aramiworks/stock-tracker/commit/22bec755dd4be862132ad59be13959cd245c6c12), [`464a152`](https://github.com/aramiworks/stock-tracker/commit/464a1529ecdd8934a818c3841c47d4a509999540), [`59723a8`](https://github.com/aramiworks/stock-tracker/commit/59723a81a52679379cd743d750f972686a38c679), [`ff31b6b`](https://github.com/aramiworks/stock-tracker/commit/ff31b6b45f4fe89fef624029b379c5daaaff9250), [`29f9da1`](https://github.com/aramiworks/stock-tracker/commit/29f9da1e109612a6cac1aecd8961840d74cc5979)]:
  - @stock-tracker/validation@0.1.0
  - @stock-tracker/nestjs-common@0.1.0
