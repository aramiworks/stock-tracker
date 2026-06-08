# @stock-tracker/config

## 0.1.0

### Minor Changes

- [#352](https://github.com/aramiworks/stock-tracker/pull/352) [`70c57c6`](https://github.com/aramiworks/stock-tracker/commit/70c57c6dc15cd837f03c6b79065bf5cd2d93013a) Thanks [@cheunjm](https://github.com/cheunjm)! - Add BetterStack Pino transport to all backend services for centralized log management.

### Patch Changes

- [#350](https://github.com/aramiworks/stock-tracker/pull/350) [`9c5aa00`](https://github.com/aramiworks/stock-tracker/commit/9c5aa002d76587ccf7b7b7e1243e6dd9d056d6c9) Thanks [@cheunjm](https://github.com/cheunjm)! - Add `auto-resolve-conflicts.yml` workflow. Triggered after `Auto-update PR branches` completes; posts a `@claude` comment on any conflicting open PRs to request automatic rebase resolution. Sourced from `aramiworks/.github`.

- [#354](https://github.com/aramiworks/stock-tracker/pull/354) [`6579aae`](https://github.com/aramiworks/stock-tracker/commit/6579aaef986590746b511200450c42585432de6a) Thanks [@cheunjm](https://github.com/cheunjm)! - Allow `claude-arami[bot]` to trigger Claude Code in `claude.yml`. The `actions-cool/check-user-permission` action returns false for GitHub App bot identities (they don't appear as collaborators with explicit write permission), so the auto-resolve-conflicts workflow's `@claude` comments were silently rejected. Adding a bot allowlist bypass fixes conflict auto-resolution.

- [#250](https://github.com/aramiworks/stock-tracker/pull/250) [`9925c4b`](https://github.com/aramiworks/stock-tracker/commit/9925c4b5c5eda47122651b79f9634a6fe28b2f61) Thanks [@cheunjm](https://github.com/cheunjm)! - Remove 140 stale changesets that referenced invalid package name and blocked the release workflow.

- [#259](https://github.com/aramiworks/stock-tracker/pull/259) [`dc5d6bb`](https://github.com/aramiworks/stock-tracker/commit/dc5d6bbee0b5ace9f7cd4c2142afc1a617e474a1) Thanks [@cheunjm](https://github.com/cheunjm)! - Add unit tests for createLogger with 100% coverage enforcement.

- [#379](https://github.com/aramiworks/stock-tracker/pull/379) [`f53668c`](https://github.com/aramiworks/stock-tracker/commit/f53668c38c4b27f3a2132ba536b62da9fb5fcc8a) Thanks [@cheunjm](https://github.com/cheunjm)! - Update DOPPLER.md proxy credentials table to match live Oxylabs Doppler keys.

- [#260](https://github.com/aramiworks/stock-tracker/pull/260) [`8972c3c`](https://github.com/aramiworks/stock-tracker/commit/8972c3c3a89e2dab47c079fa902ab6e240721807) Thanks [@cheunjm](https://github.com/cheunjm)! - Use prisma db push instead of migrate deploy in E2E workflow — no Prisma migrations exist.

- [#357](https://github.com/aramiworks/stock-tracker/pull/357) [`2b3c328`](https://github.com/aramiworks/stock-tracker/commit/2b3c3284e8bcc7a4f78880a809ab8c6127fdebb1) Thanks [@cheunjm](https://github.com/cheunjm)! - Add `subgraph-auth` to the Railway redeploy SERVICES list so the new auth subgraph (split out in INF-1246) gets redeployed by CI alongside the other backend services. Also clean up `subgraph-tracker` env vars to drop `DATABASE_URL` and `TRPC_AUTH_SERVICE_URL`, which it no longer reads after the split.

- [#361](https://github.com/aramiworks/stock-tracker/pull/361) [`f7cf9d9`](https://github.com/aramiworks/stock-tracker/commit/f7cf9d9deb429980ac3889c8bc5198b254acc682) Thanks [@cheunjm](https://github.com/cheunjm)! - Make backend Docker publishing manual-only and rename master image tag from `latest` to `master`.
  - Drop `push: main` trigger from `backend-docker.yml` — every backend deploy now goes through `workflow_dispatch`.
  - Fix the dispatch dropdown: `staging` → `stage` (matches Railway env name, Doppler config, and `infra/railway/src/config.ts`).
  - Switch master `imageTag` from `latest` to `master` so all three envs follow the same `:{env}` convention (`:develop`, `:stage`, `:master`).
  - Mirror the `staging` → `stage` rename in `schema-publish.yml`.
  - Update `CLAUDE.md` deployment table to reflect manual-only flow.

- [#386](https://github.com/aramiworks/stock-tracker/pull/386) [`ed520f3`](https://github.com/aramiworks/stock-tracker/commit/ed520f37f1a603d1d480b147c9aa39d0a99416d3) Thanks [@cheunjm](https://github.com/cheunjm)! - Switch to the Claude Code review workflow: add a thin per-repo wrapper calling the reusable `claude-review.yml` in `aramiworks/.github`. Removes config for the previous third-party PR-review bot.

- [#397](https://github.com/aramiworks/stock-tracker/pull/397) [`3546e4c`](https://github.com/aramiworks/stock-tracker/commit/3546e4cd2c97447eb7fecc1b0df8ea699b0ce36f) Thanks [@cheunjm](https://github.com/cheunjm)! - Delete the unreferenced `claude-respond.yml` workflow. Its only trigger (responding to the previous third-party PR-review bot) is no longer reachable; `claude-review.yml` covers the same surface.

- [#401](https://github.com/aramiworks/stock-tracker/pull/401) [`a4f3d85`](https://github.com/aramiworks/stock-tracker/commit/a4f3d85ee7cc025990cc2a7266c36e1b3139b6e2) Thanks [@cheunjm](https://github.com/cheunjm)! - Rewrite earlier changeset descriptions to be tool-agnostic so the published CHANGELOG reads cleanly.

- [#404](https://github.com/aramiworks/stock-tracker/pull/404) [`e66ed9a`](https://github.com/aramiworks/stock-tracker/commit/e66ed9a1d677838fa935b7015af29e0930a98f36) Thanks [@cheunjm](https://github.com/cheunjm)! - Reassign two changesets (inf-1309, inf-1322) from `@stock-tracker/railway-infra` to `@stock-tracker/config` since `infra/*` isn't in the npm workspaces. Unblocks the release workflow.

- [#376](https://github.com/aramiworks/stock-tracker/pull/376) [`9cfbc48`](https://github.com/aramiworks/stock-tracker/commit/9cfbc48164fbbb11cf6455ca6a72a4f9ceb6eb11) Thanks [@cheunjm](https://github.com/cheunjm)! - Correct proxy provider evaluation — Oxylabs no longer offers residential free trial.

- [#369](https://github.com/aramiworks/stock-tracker/pull/369) [`0fc9d4f`](https://github.com/aramiworks/stock-tracker/commit/0fc9d4f532c2900eacb64c43fe42b65a902d07fc) Thanks [@cheunjm](https://github.com/cheunjm)! - Add residential proxy provider evaluation and Doppler key scaffolding for restock scraper.
