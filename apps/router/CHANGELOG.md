# @stock-tracker/router

## 0.1.0

### Patch Changes

- [#322](https://github.com/aramiworks/stock-tracker/pull/322) [`378bf93`](https://github.com/aramiworks/stock-tracker/commit/378bf933f5bb42e3904341ffbfac8b26a8efbd6d) Thanks [@cheunjm](https://github.com/cheunjm)! - fix(router): [INF-1224] rename PORT to ROUTER_PORT to avoid service port collision

- [#292](https://github.com/aramiworks/stock-tracker/pull/292) [`2319dc8`](https://github.com/aramiworks/stock-tracker/commit/2319dc8422a4b34194eecbd3b47319534a94b47e) Thanks [@cheunjm](https://github.com/cheunjm)! - Commit untracked rhai scripts to git — fixes Docker build failure.

- [#343](https://github.com/aramiworks/stock-tracker/pull/343) [`585646e`](https://github.com/aramiworks/stock-tracker/commit/585646e4801dd946f23ead96d5567aebfa92ff69) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix Router E2E stack using ROUTER_PORT instead of PORT after INF-1224 rename.

- [#291](https://github.com/aramiworks/stock-tracker/pull/291) [`b4b0393`](https://github.com/aramiworks/stock-tracker/commit/b4b0393ab27474263e7f70bf05defcca5c615df9) Thanks [@cheunjm](https://github.com/cheunjm)! - Copy rhai scripts directory into Docker image — fixes router crash on startup.

- [#317](https://github.com/aramiworks/stock-tracker/pull/317) [`52c893b`](https://github.com/aramiworks/stock-tracker/commit/52c893b0abcbaadd79358c18b6804a4a6d2beb55) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix CORS config: replace invalid `cors.policies` wrapper with flat `cors.origins`, and rename `ALLOWED_ORIGINS` (which expanded to a comma-separated string) to `CORS_ORIGIN` (must be a single URL).

- [#303](https://github.com/aramiworks/stock-tracker/pull/303) [`3cd22bd`](https://github.com/aramiworks/stock-tracker/commit/3cd22bdaac38e8b9f115228860ee5a47595133b3) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix router crash: use PORT env var and migrate CORS to v2 policy format.

- [#314](https://github.com/aramiworks/stock-tracker/pull/314) [`00f5c4a`](https://github.com/aramiworks/stock-tracker/commit/00f5c4a8adfd6a3450a18fc8d54ba73a4bf04edb) Thanks [@cheunjm](https://github.com/cheunjm)! - Add default values for PORT (4002) and ALLOWED_ORIGINS so rover dev works locally without env vars set.

- [#307](https://github.com/aramiworks/stock-tracker/pull/307) [`5d16008`](https://github.com/aramiworks/stock-tracker/commit/5d16008ecf4707f1bad6875b0be37cbde8644f98) Thanks [@cheunjm](https://github.com/cheunjm)! - Set WORKDIR to /dist/config so rhai scripts resolve correctly at runtime.
