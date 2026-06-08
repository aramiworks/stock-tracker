# @stock-tracker/auth-service

## 0.1.0

### Minor Changes

- [#252](https://github.com/aramiworks/stock-tracker/pull/252) [`808c4e4`](https://github.com/aramiworks/stock-tracker/commit/808c4e46b8b4ce97d53bfda601ead681a6045d66) Thanks [@cheunjm](https://github.com/cheunjm)! - Add auth NestJS + tRPC microservice (Phase 1 of NestJS migration).

- [#324](https://github.com/aramiworks/stock-tracker/pull/324) [`b07e2e6`](https://github.com/aramiworks/stock-tracker/commit/b07e2e6a1bad10042735948fd6ada69c0cf4dd19) Thanks [@cheunjm](https://github.com/cheunjm)! - Add Sentry error tracking to auth-service with EFCV tagging via tRPC middleware.

### Patch Changes

- [#375](https://github.com/aramiworks/stock-tracker/pull/375) [`41c37d0`](https://github.com/aramiworks/stock-tracker/commit/41c37d069f9a10b9a3655da24b2f5b1b2c2da995) Thanks [@cheunjm](https://github.com/cheunjm)! - Upload auth-service Sentry source maps from Backend Docker workflow so production stack traces symbolicate to original TypeScript.

- [#319](https://github.com/aramiworks/stock-tracker/pull/319) [`29cee19`](https://github.com/aramiworks/stock-tracker/commit/29cee19f4d0b1b7c78c1ee8ad746be6c88845770) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix createAccount FK failure by syncing auth_users on sign-in. auth_users.id is now set to the Supabase UUID so tracker_accounts.auth_user_id resolves correctly. Adds upsertUser GraphQL mutation called after sign-in to create the profile record.

- [#318](https://github.com/aramiworks/stock-tracker/pull/318) [`83460a1`](https://github.com/aramiworks/stock-tracker/commit/83460a1b8764eb4dfea87b88479ccaca6582a4d4) Thanks [@cheunjm](https://github.com/cheunjm)! - Build auth-service before subgraph e2e tests and bump timeout to 15min.

- [#288](https://github.com/aramiworks/stock-tracker/pull/288) [`127013e`](https://github.com/aramiworks/stock-tracker/commit/127013e46b53232a719545d5786d991b8457ec03) Thanks [@cheunjm](https://github.com/cheunjm)! - Add auth-service (port 4030) and tracker-service (port 4020) to GHCR build matrix and Railway service config. Parameterize `infra/docker/node-service.Dockerfile` with `ARG ENTRYPOINT_FILE` so NestJS services run `dist/main.js`. Additive — `apps/api` remains in place; subgraph traffic still points at it.

- [#293](https://github.com/aramiworks/stock-tracker/pull/293) [`6ccd92f`](https://github.com/aramiworks/stock-tracker/commit/6ccd92fabf98060087f04b16233000cfe1ae8980) Thanks [@cheunjm](https://github.com/cheunjm)! - Cut subgraph-tracker over to auth-service (port 4030) and tracker-service (port 4020) on Railway. Subgraph now reads `TRPC_AUTH_SERVICE_URL` + `TRPC_TRACKER_SERVICE_URL` instead of the legacy `TRPC_SERVICE_URL` (apps/api). Adds `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` to tracker-service envVars (required by `baseEnvSchema`). Doppler develop/stage/master synced with the new env vars.

- [#300](https://github.com/aramiworks/stock-tracker/pull/300) [`acbe115`](https://github.com/aramiworks/stock-tracker/commit/acbe115ed14f49c7bb6281358f3cd222abc93cbb) Thanks [@cheunjm](https://github.com/cheunjm)! - Rewrite subgraph e2e helpers to spawn auth-service as a child process, mirroring the tracker-service pattern. Drops the inline tRPC server backed by `@stock-tracker/api`. Generalizes `spawnTrackerTestServer` into a reusable `spawnNestTestServer` helper.

- [#337](https://github.com/aramiworks/stock-tracker/pull/337) [`29f9da1`](https://github.com/aramiworks/stock-tracker/commit/29f9da1e109612a6cac1aecd8961840d74cc5979) Thanks [@cheunjm](https://github.com/cheunjm)! - Add Sentry error tracking to tracker-service via shared `@stock-tracker/nestjs-common` Sentry module. Errors thrown from tRPC procedures are captured with EFCV tags (experience/flow/container) derived from the procedure path.

  `initSentry({ dsn })` is now required (removed implicit `process.env.SENTRY_DSN` fallback) so each service reads its own per-service DSN env var (`AUTH_SERVICE_SENTRY_DSN`, `TRACKER_SERVICE_SENTRY_DSN`) and services sharing a Doppler config can't cross-report errors.

- [#383](https://github.com/aramiworks/stock-tracker/pull/383) [`9fff26d`](https://github.com/aramiworks/stock-tracker/commit/9fff26d1738a5640436db8fbe5b85b14b2b6fb83) Thanks [@cheunjm](https://github.com/cheunjm)! - Make Sentry source map upload non-blocking and skip set_commits/finalize so transient Sentry errors don't fail the Backend Docker workflow and block deploys.

- [#286](https://github.com/aramiworks/stock-tracker/pull/286) [`1f5344a`](https://github.com/aramiworks/stock-tracker/commit/1f5344ac526f9be6b337c615fcc229e029c267e9) Thanks [@cheunjm](https://github.com/cheunjm)! - Wire the tracker subgraph's auth resolver to the new NestJS auth-service (port 4030, `/trpc`) via `TRPC_AUTH_SERVICE_URL`. Local-only cutover — apps/api remains in the tree and on Railway as the production auth backend until a follow-up issue migrates the deploy.

- Updated dependencies [[`6591e72`](https://github.com/aramiworks/stock-tracker/commit/6591e722e32b0ffff562371f250e795aa308ce77), [`41c37d0`](https://github.com/aramiworks/stock-tracker/commit/41c37d069f9a10b9a3655da24b2f5b1b2c2da995), [`70c57c6`](https://github.com/aramiworks/stock-tracker/commit/70c57c6dc15cd837f03c6b79065bf5cd2d93013a), [`eedeffa`](https://github.com/aramiworks/stock-tracker/commit/eedeffae9416f5741e1105fb8c37abba60523b05), [`9563de7`](https://github.com/aramiworks/stock-tracker/commit/9563de7eb8b505510c4292fc53eb503843247e5d), [`2a355f2`](https://github.com/aramiworks/stock-tracker/commit/2a355f24df5e693b1a92465e37995d2bfd23fc14), [`22bec75`](https://github.com/aramiworks/stock-tracker/commit/22bec755dd4be862132ad59be13959cd245c6c12), [`464a152`](https://github.com/aramiworks/stock-tracker/commit/464a1529ecdd8934a818c3841c47d4a509999540), [`59723a8`](https://github.com/aramiworks/stock-tracker/commit/59723a81a52679379cd743d750f972686a38c679), [`ff31b6b`](https://github.com/aramiworks/stock-tracker/commit/ff31b6b45f4fe89fef624029b379c5daaaff9250), [`29f9da1`](https://github.com/aramiworks/stock-tracker/commit/29f9da1e109612a6cac1aecd8961840d74cc5979)]:
  - @stock-tracker/validation@0.1.0
  - @stock-tracker/nestjs-common@0.1.0
