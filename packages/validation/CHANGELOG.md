# @stock-tracker/validation

## 0.1.0

### Minor Changes

- [#446](https://github.com/aramiworks/stock-tracker/pull/446) [`6591e72`](https://github.com/aramiworks/stock-tracker/commit/6591e722e32b0ffff562371f250e795aa308ce77) Thanks [@cheunjm](https://github.com/cheunjm)! - Add push_devices table and registerPushDevice/unregisterPushDevice mutations so a device's Expo push token can be associated with the current user — the foundation for restock push notifications.

- [#365](https://github.com/aramiworks/stock-tracker/pull/365) [`eedeffa`](https://github.com/aramiworks/stock-tracker/commit/eedeffae9416f5741e1105fb8c37abba60523b05) Thanks [@cheunjm](https://github.com/cheunjm)! - Add cursor-based pagination to catalog browse API and MVP catalog seed (Hermes bags + Cartier watches).

- [#351](https://github.com/aramiworks/stock-tracker/pull/351) [`2a355f2`](https://github.com/aramiworks/stock-tracker/commit/2a355f24df5e693b1a92465e37995d2bfd23fc14) Thanks [@cheunjm](https://github.com/cheunjm)! - Pivot backend data model from Cartier purchase tracker to Hermes Korea restock alert app.

- [#380](https://github.com/aramiworks/stock-tracker/pull/380) [`22bec75`](https://github.com/aramiworks/stock-tracker/commit/22bec755dd4be862132ad59be13959cd245c6c12) Thanks [@cheunjm](https://github.com/cheunjm)! - Add anonymous-readable `tracker.catalog.list` tRPC procedure and `catalogList` GraphQL query returning active watchable_units grouped by (brand, productLine) for the Shengsho-style catalog browse UI.

- [#387](https://github.com/aramiworks/stock-tracker/pull/387) [`464a152`](https://github.com/aramiworks/stock-tracker/commit/464a1529ecdd8934a818c3841c47d4a509999540) Thanks [@cheunjm](https://github.com/cheunjm)! - INF-1415 — Add tracker subgraph watchlist queries + mutations (`watchlist`, `watchlistDetail`, `watchlistAdd`, `watchlistRemove`). New tRPC procedures expose unit-level watches grouped by `(brand, productLine)` with derived stock `state` and `lastRestockedAt`. All endpoints are JWT-protected; add/remove are idempotent. No schema change — uses the existing `watches` table with `sku_id = NULL` for unit-level watches.

- [#395](https://github.com/aramiworks/stock-tracker/pull/395) [`59723a8`](https://github.com/aramiworks/stock-tracker/commit/59723a81a52679379cd743d750f972686a38c679) Thanks [@cheunjm](https://github.com/cheunjm)! - INF-1479 — Add tracker subgraph `alertHistory(limit, cursor): AlertHistoryPage!` query. New JWT-protected tRPC procedure `tracker.alertHistory.list({ limit, cursor })` returns past drop events scoped to the user's watchlist (unit-level OR sku-level watches), ordered by `detected_at DESC` with timestamp-based cursor pagination. Each row exposes `{ id, brand, productLine, modelName, skuDescriptor, kind, detectedAt }`. `kind` is typed `"restocked" | "soldOut"` for forward compatibility — today the controller always emits `"restocked"` because `drop_events` has no kind discriminator. No schema change.

### Patch Changes

- [#281](https://github.com/aramiworks/stock-tracker/pull/281) [`9563de7`](https://github.com/aramiworks/stock-tracker/commit/9563de7eb8b505510c4292fc53eb503843247e5d) Thanks [@cheunjm](https://github.com/cheunjm)! - Add 100% Jest coverage for validation schemas and enforce a 100% coverage threshold in jest.config.ts.
