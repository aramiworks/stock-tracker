# @stock-tracker/storybook

## 0.1.0

### Patch Changes

- [#426](https://github.com/aramiworks/stock-tracker/pull/426) [`c4f78d6`](https://github.com/aramiworks/stock-tracker/commit/c4f78d631aaad9edcc7f2740a47d16552c925d7b) Thanks [@cheunjm](https://github.com/cheunjm)! - Repair the corrupted, duplicated `config.define` block in `.storybook/main.ts` that broke the repo-wide format:check CI gate.

- [#348](https://github.com/aramiworks/stock-tracker/pull/348) [`407cddb`](https://github.com/aramiworks/stock-tracker/commit/407cddb3fb7ad2050df630f63e3cd69a41340389) Thanks [@cheunjm](https://github.com/cheunjm)! - Add react-i18next mock to Storybook Vite config to fix 16 Chromatic render errors caused by views calling useTranslation without an i18n provider.

- [#407](https://github.com/aramiworks/stock-tracker/pull/407) [`960b280`](https://github.com/aramiworks/stock-tracker/commit/960b2800d70bde55486724e3733a9bb4e21f486d) Thanks [@cheunjm](https://github.com/cheunjm)! - Force react/jsx-runtime into Vite optimizeDeps to fix ESM import error with framer-motion.

- [#412](https://github.com/aramiworks/stock-tracker/pull/412) [`5e43f68`](https://github.com/aramiworks/stock-tracker/commit/5e43f680b661074e1ef78af1b3c5446af731fabc) Thanks [@cheunjm](https://github.com/cheunjm)! - Pre-bundle react-native-web nested CJS deps for Vite 8 ESM compatibility.

- [#420](https://github.com/aramiworks/stock-tracker/pull/420) [`0f76073`](https://github.com/aramiworks/stock-tracker/commit/0f76073fe7ef312353ce118d91219216643ebc69) Thanks [@cheunjm](https://github.com/cheunjm)! - Add process.env shim to Vite define for Tamagui browser compatibility.

- [#411](https://github.com/aramiworks/stock-tracker/pull/411) [`0f72599`](https://github.com/aramiworks/stock-tracker/commit/0f725990986f693cecf23bf64ad303f6a8004ea3) Thanks [@cheunjm](https://github.com/cheunjm)! - Add react-dom to optimizeDeps.include for Vite 8 ESM compatibility.

- [#424](https://github.com/aramiworks/stock-tracker/pull/424) [`cadbf3c`](https://github.com/aramiworks/stock-tracker/commit/cadbf3c981aab5e6a3391cf786dfb440171217fa) Thanks [@cheunjm](https://github.com/cheunjm)! - Remove @aramiworks/ui from optimizeDeps exclude to fix Vite 8 CJS cascade; fix malformed define block from bad merge.

- [#417](https://github.com/aramiworks/stock-tracker/pull/417) [`066cf7d`](https://github.com/aramiworks/stock-tracker/commit/066cf7db299a2e4d0231b717f9bb6c7c40ba72ed) Thanks [@cheunjm](https://github.com/cheunjm)! - Pre-bundle react-native-web to fix Vite 8 CJS cascade from excluded @aramiworks/ui.

- [#278](https://github.com/aramiworks/stock-tracker/pull/278) [`e61e614`](https://github.com/aramiworks/stock-tracker/commit/e61e6145dfe136608fa899e55eb0deb5ef044abe) Thanks [@cheunjm](https://github.com/cheunjm)! - Restore ReactFabric Vite mock plugin that was removed by INF-1046, fixing Storybook build failure.

- [#422](https://github.com/aramiworks/stock-tracker/pull/422) [`428323d`](https://github.com/aramiworks/stock-tracker/commit/428323db8bc07886e1b017c517c1b861de9e258c) Thanks [@cheunjm](https://github.com/cheunjm)! - Collapse the duplicated `config.define = {...}` block in `apps/storybook/.storybook/main.ts` that landed via the INF-1552 squash merge. Restores `format:check`, `lint`, and `build` on every open PR.

- [#442](https://github.com/aramiworks/stock-tracker/pull/442) [`e8a8c98`](https://github.com/aramiworks/stock-tracker/commit/e8a8c9834d780664267567d3300387bf72645645) Thanks [@cheunjm](https://github.com/cheunjm)! - Resolve real `ko` translation copy in the Storybook react-i18next mock so stories render actual Korean text instead of raw i18n key paths (e.g. `account.home.accountInfoCard.emailLabel`).

- [#258](https://github.com/aramiworks/stock-tracker/pull/258) [`fcf90c5`](https://github.com/aramiworks/stock-tracker/commit/fcf90c52497f6d904e865fed1a8508fe3b59b801) Thanks [@cheunjm](https://github.com/cheunjm)! - Storybook Vite mock now intercepts both `react-native/...` and the aliased `react-native-web/...` ReactFabric paths.
