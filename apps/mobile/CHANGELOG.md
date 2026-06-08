# @stock-tracker/mobile

## 0.1.0

### Minor Changes

- [#398](https://github.com/aramiworks/stock-tracker/pull/398) [`d533c67`](https://github.com/aramiworks/stock-tracker/commit/d533c67da530a56421edbd90fde22de6ffcf940e) Thanks [@cheunjm](https://github.com/cheunjm)! - Refactor `auth-signIn-gmailOauth` container views to match the new Figma design (red brand hero + white rounded card split layout). Add a Storybook story (`auth/signIn/gmailOauth`) with `Default`, `Loading`, `Error`, and `Overview` variants. The views now accept a `screenState` prop (`"default" | "loading" | "error"`); when omitted they derive from the controller's `isSigningIn` (default behaviour preserved). Adds new `auth-signIn-gmailOauth-header.view` (brand hero), wires the existing `errorState` view into the screenState dispatch, and updates `loadingState`/`errorState` text colors for the new white-card background.

- [#403](https://github.com/aramiworks/stock-tracker/pull/403) [`9066456`](https://github.com/aramiworks/stock-tracker/commit/9066456c2f440ee7f24c9e75ec67655427374603) Thanks [@cheunjm](https://github.com/cheunjm)! - Wire `signInError` into the auth-signIn-gmailOauth controller so the error view (already in code, Figma, and Storybook from INF-1435) renders at runtime when sign-in fails. Adds `signInError: boolean` to `AuthSignInGmailOauthControllersOutput` — cleared at the start of every `signInWithGoogle` call and the web auth-session response handler, set to `true` inside each sign-in catch block. Views derive `screenState = "error"` when `signInError` is true (preferred over `loading` when both flags coincide). The container's `ConnectedViews` passes `onRetry={signInWithGoogle}` so tapping "다시 시도" retries.

- [#423](https://github.com/aramiworks/stock-tracker/pull/423) [`7a2f3b3`](https://github.com/aramiworks/stock-tracker/commit/7a2f3b3510280c49b8433e8f5e0c5a9c62c7a8e1) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate hardcoded `#FF2D55` (Cartier red) across stock-tracker mobile to `colors.primary` from `@aramiworks/ui` (`#0066FF`). The mobile app now uses the design system's primary token everywhere a brand accent was previously hardcoded. Figma file `MSJ05A0BXBDTO0powtUMg3` updated to match — 78 SOLID fills/strokes across 6 pages (tracker experience, catalog browse, watchlist list/detail, alertHistory browse).

  Changes:
  - Brand accents (chips, CTAs, accents in `tracker-history-browse-{date,category}FilterChips`, `tracker-accounts-detail-{addPurchaseButton,trailingActions,saHeader}`, `tracker-dashboard-home-{saCard,spendSummaryCard}`, `tracker-watchlist-list-{addButton,emptyState}`) → `colors.primary`.
  - Warning-state indicators (`tracker-eligibilityBadge.view` notEligible, `tracker-errorState.view` error icon, `tracker-dashboard-home-saCard.view` notEligible status) → `stateColors.red` (`#FF3B30` iOS systemRed) instead of brand red.
  - Soft pink avatar backgrounds (`#FFE8ED`) on `tracker-dashboard-home-saCard.view` and `tracker-accounts-detail-saHeader.view` → soft blue (`#E5EEFF`) to pair with the new primary.
  - `app.config.ts` Android adaptive icon background `#FF2D55` → `#0066FF`.
  - `state.ts` `red` value changed from `#ff2d55` to `#FF3B30` (iOS systemRed) so the warning red is visually distinct from the new brand primary.
  - `state.test.ts` updated to match.
  - `CLAUDE.md` Design section updated — Primary is now `colors.primary` from `@aramiworks/ui` (`#0066FF`), no longer Cartier red.
  - `src/setup.ts` Jest mock for `@aramiworks/ui` extended with a `colors` token export so component tests resolve `colors.primary` at runtime.

  Auth-flow files (`auth-signIn-gmailOauth.views.tsx`, `auth-signIn-gmailOauth-header.view.tsx`, `auth-signIn-gmailOauth-errorState.view.tsx`) are out of scope here — they're already migrated in PR [#413](https://github.com/Arami-Works/stock-tracker/issues/413).

- [#429](https://github.com/aramiworks/stock-tracker/pull/429) [`801450b`](https://github.com/aramiworks/stock-tracker/commit/801450ba7d85c550330f598e32e4f737a54eb1a7) Thanks [@cheunjm](https://github.com/cheunjm)! - Bring `tracker-account-home` up to the canonical container pattern established by `tracker-dashboard-home` and `auth-signIn-gmailOauth`.

  **Code:**
  - Extract 5 sub-views so the aggregator follows the container composition rule (no raw `<Text>` atoms):
    - `tracker-account-home-accountInfoCard.view.tsx` — Card with email + signup date rows
    - `tracker-account-home-signOutButton.view.tsx` — sign-out Button
    - `tracker-account-home-versionFooter.view.tsx` — app version footer
    - `tracker-account-home-loadingState.view.tsx` — skeleton card (loading state)
    - `tracker-account-home-errorState.view.tsx` — wraps `TrackerErrorStateView`
  - `tracker-account-home.views.tsx` now accepts `screenState?: "default" | "loading" | "error"`, defaults to `"default"`. Dispatch via `content[screenState]`.
  - Aggregator test rewritten to drive each state via the prop.
  - Each sub-view has its own focused test.
  - `setup.ts` `@aramiworks/ui` mock: `Button` now propagates `disabled` as `accessibilityState.disabled`; added `Divider` stub.

  **Storybook:**
  - New `tracker-account-home/tracker-account-home.story.tsx` mirroring the dashboard-home story shape (Default / Loading / Error / Overview with `OverviewLayout`). Figma design URL anchored to page node `788:4`.

  **Figma** (file `MSJ05A0BXBDTO0powtUMg3`, page `↳ tracker-account-home` `788:4`):
  - Rebuilt the Container — previously a single FRAME `795:5` — as a proper `tracker-account-home.container` COMPONENT_SET (`923:19`) with State=default (`923:2`), State=loading (`923:3`), and State=error (`923:11`) variants. Existing default content preserved; new loading variant is a skeleton-card mockup; new error variant centers an iOS-systemRed error mark + "문제가 발생했어요" + brand-primary "다시 시도" CTA.

- [#447](https://github.com/aramiworks/stock-tracker/pull/447) [`83bb824`](https://github.com/aramiworks/stock-tracker/commit/83bb82441aea9c5f9f65f4df849b7b0e7325b383) Thanks [@cheunjm](https://github.com/cheunjm)! - Catalog browse: add a Hermès | Cartier segmented brand filter (one brand at a time) and indent item rows under their product-line header to match Figma.

- [#450](https://github.com/aramiworks/stock-tracker/pull/450) [`4268f55`](https://github.com/aramiworks/stock-tracker/commit/4268f55c7a61248ea07fd973e1c0324c10349a55) Thanks [@cheunjm](https://github.com/cheunjm)! - Add restock push notifications on mobile: register/unregister the device's Expo
  push token around login/logout, foreground + cold-start notification handlers
  that deep-link to the watchlist detail, and a `useRefetchOnRestock` event seam
  that refreshes open watchlist screens live when a restock push arrives.

- [#240](https://github.com/aramiworks/stock-tracker/pull/240) [`225dc82`](https://github.com/aramiworks/stock-tracker/commit/225dc82f4f65e326684d196fcb3ebdd2b18a4e83) Thanks [@cheunjm](https://github.com/cheunjm)! - Add packages/nestjs-common with shared NestJS modules (Prisma, Config, Logger, Health, tRPC base service) for the NestJS microservices migration.

- [#264](https://github.com/aramiworks/stock-tracker/pull/264) [`be65bf7`](https://github.com/aramiworks/stock-tracker/commit/be65bf73921c562aeed78b8f2dd39c071d415885) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate shared tracker views to @aramiworks/ui@0.7.0 — no direct tamagui or react-native primitive imports.

- [#271](https://github.com/aramiworks/stock-tracker/pull/271) [`8788cdf`](https://github.com/aramiworks/stock-tracker/commit/8788cdf532e30b9d7ddcd92522a72a84fe368dcc) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate dashboard-home view to DashboardTemplate from @aramiworks/ui — replaces raw RN ScrollView/RefreshControl/fab container with template props.

- [#272](https://github.com/aramiworks/stock-tracker/pull/272) [`e45ae5a`](https://github.com/aramiworks/stock-tracker/commit/e45ae5a08c60889e6bbf783b8f8b6272022186b8) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate accounts-list view to ListTemplate from @aramiworks/ui — replaces raw RN ScrollView/RefreshControl/fab container with template props, and swaps the custom Pressable add-account FAB for the shared FAB component.

- [#275](https://github.com/aramiworks/stock-tracker/pull/275) [`69bdc39`](https://github.com/aramiworks/stock-tracker/commit/69bdc3913d98b63f1d4aa8ad499a6212b4ce2f67) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate history-browse view to ListTemplate from @aramiworks/ui — replaces raw RN ScrollView/RefreshControl with template props (topBar + headerContent + refreshControl).

- [#277](https://github.com/aramiworks/stock-tracker/pull/277) [`af801b6`](https://github.com/aramiworks/stock-tracker/commit/af801b6270507d547be4973202d6067efff4ab9f) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate accounts-detail view to DetailTemplate from @aramiworks/ui — replaces raw RN View/ScrollView wrapper with template props (topBar + refreshControl). Completes Phase 2 migration of tracker screens to shared templates.

- [#382](https://github.com/aramiworks/stock-tracker/pull/382) [`51cd503`](https://github.com/aramiworks/stock-tracker/commit/51cd5039a6f66f5b848a36a24db5b8b90416024e) Thanks [@cheunjm](https://github.com/cheunjm)! - Add `tracker/catalog/browse` container — Shengsho-style product line grouping with per-row + master "All products" checkboxes. Wires up against the real GraphQL `catalogList` query (proxying tRPC `catalog.list` from INF-1393), with Suspense + ErrorBoundary for loading/error states. Bottom nav is Shengsho-strict (Watchlist → History, 2 tabs only); catalog is reached via a `+ 추가` entry point in the Watchlist header.

- [#388](https://github.com/aramiworks/stock-tracker/pull/388) [`0030f97`](https://github.com/aramiworks/stock-tracker/commit/0030f970fb696a12c9a595f36870f71196f3bd45) Thanks [@cheunjm](https://github.com/cheunjm)! - Add Shengsho-style `tracker/watchlist/list` + `tracker/watchlist/detail` containers. Watchlist tab now renders the new grouped list (state pills + relative timestamps) with a `+ 추가` entry into the catalog; tapping a row pushes a dynamic detail screen with hero, current-stock SKU rows, and a restock history section. Mock-resolved until INF-1415 wires real `watchlist.list` + `watchlist.detail` tRPC/GraphQL.

- [#396](https://github.com/aramiworks/stock-tracker/pull/396) [`93d4cf2`](https://github.com/aramiworks/stock-tracker/commit/93d4cf293867d868bc3521bab687684e96d22617) Thanks [@cheunjm](https://github.com/cheunjm)! - Ship `tracker/alertHistory/browse` Shengsho-style chronological drop-event list resolved against the live protected `alertHistory` GraphQL query (INF-1479). Includes row/empty/skeleton views, Storybook stories, and Maestro flow. Renames the History tab nav label to "내역" and adds a `teal` token (#009E99) for the soldOut left-indicator bar per the design hand-off. The view-layer `*.mock.ts` fixture is kept for Storybook + view-layer tests.

- [#408](https://github.com/aramiworks/stock-tracker/pull/408) [`368afab`](https://github.com/aramiworks/stock-tracker/commit/368afabfad9c2cefef44f6b4193d664f354e364d) Thanks [@cheunjm](https://github.com/cheunjm)! - Restructure tracker views to per-view subdirectories (`views/<viewName>/<viewName>.{tsx,test.tsx,story.tsx}`) and add container-level Storybook entries for alertHistory/browse, catalog/browse, watchlist/list, and watchlist/detail (with HermesSingleSku + CartierMultiSku variants).

- [#427](https://github.com/aramiworks/stock-tracker/pull/427) [`924fcf6`](https://github.com/aramiworks/stock-tracker/commit/924fcf6c9ec61fe287cb3f5402ef396edea8de6d) Thanks [@cheunjm](https://github.com/cheunjm)! - Delete pre-Shengsho legacy code (alerts/, history/, tracker-accounts-detail-\*), repoint post-auth landing to /tracker/watchlist, migrate auth/signIn/gmailOauth to short-name subdir layout, and rename all tracker container view files back to long-name inside short-name subdirs to match the corrected convention.

- [#362](https://github.com/aramiworks/stock-tracker/pull/362) [`ae6fb01`](https://github.com/aramiworks/stock-tracker/commit/ae6fb0103e45155652af244f8204f67b728d04fe) Thanks [@cheunjm](https://github.com/cheunjm)! - Add Mixpanel product analytics with EFCV-tagged screen views, sign-in events, identify on session restore/login, reset on logout, and AsyncStorage-backed consent gate (GDPR).

- [#255](https://github.com/aramiworks/stock-tracker/pull/255) [`6a04336`](https://github.com/aramiworks/stock-tracker/commit/6a043360ebfe1ea646c2ff6957e04274404822c6) Thanks [@cheunjm](https://github.com/cheunjm)! - Replace raw React Native primitives with aramiworks/ui atoms in shared tracker views.

- [#349](https://github.com/aramiworks/stock-tracker/pull/349) [`1f933c4`](https://github.com/aramiworks/stock-tracker/commit/1f933c417f8c44772e4cf486783e6e08bfb2300d) Thanks [@cheunjm](https://github.com/cheunjm)! - Pivot mobile app from Cartier purchase tracker to Hermès Korea restock alert.

- [#324](https://github.com/aramiworks/stock-tracker/pull/324) [`b07e2e6`](https://github.com/aramiworks/stock-tracker/commit/b07e2e6a1bad10042735948fd6ada69c0cf4dd19) Thanks [@cheunjm](https://github.com/cheunjm)! - Add Sentry error tracking to auth-service with EFCV tagging via tRPC middleware.

- [#309](https://github.com/aramiworks/stock-tracker/pull/309) [`8df7774`](https://github.com/aramiworks/stock-tracker/commit/8df777499e645bb80365854e2abcf1cab3e279b4) Thanks [@cheunjm](https://github.com/cheunjm)! - Add Sentry error tracking with EFCV tagging, Session Replay, and source map upload.

### Patch Changes

- [#373](https://github.com/aramiworks/stock-tracker/pull/373) [`33eeed9`](https://github.com/aramiworks/stock-tracker/commit/33eeed93a1d3a4668800ef39f6275ff923ad069b) Thanks [@cheunjm](https://github.com/cheunjm)! - Repoint post-pivot redirects in `app/index.tsx` and `app/(auth)/_layout.tsx` from the archived Cartier-eligibility route `/tracker/dashboard/home` to the canonical post-pivot landing route `/tracker/alerts/home` (first tab in the post-pivot tab navigator).

- [#389](https://github.com/aramiworks/stock-tracker/pull/389) [`0282683`](https://github.com/aramiworks/stock-tracker/commit/0282683b9dbaeb6585448307600e7c92a52c6a6a) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate Maestro e2e-frontend CI from native (`appId:`) to web (`url:`) driver. Replaces `appId: so.arami.stocktracker.app` with `url: ${MAESTRO_APP_URL}` across `config.yaml` and all flow YAMLs (no emulator/Chromedriver needed — Maestro 2.5.1 auto-downloads managed Chromium). Drops the Xvfb step from `e2e.yml`, pins `MAESTRO_VERSION=2.5.1`, and removes the no-op `e2eToken` launchApp argument from `helpers/launch-authenticated.yaml` (web auth uses localStorage injection via `scripts/e2e-inject-session.mjs`).

- [#400](https://github.com/aramiworks/stock-tracker/pull/400) [`887f582`](https://github.com/aramiworks/stock-tracker/commit/887f582fcee16b72e3013b34aa49b58deb18d878) Thanks [@cheunjm](https://github.com/cheunjm)! - Rewrite `scripts/e2e-seed.mjs` to match the current Hermès schema. The script previously seeded into deleted Cartier-era tables (`tracker_accounts`, `tracker_purchases`) and failed with PGRST205 once Maestro started actually running (INF-1389). It now just upserts the e2e user's `public.auth_users` row — catalog/watches seeding for authenticated flows is deferred until backend reachability lands (INF-1390) and flow assertions are aligned with `seed-dev.ts` (INF-1496). Removes the `continue-on-error: true` band-aid from the inject + seed steps in `e2e.yml`.

- [#406](https://github.com/aramiworks/stock-tracker/pull/406) [`035a4f2`](https://github.com/aramiworks/stock-tracker/commit/035a4f20672036e8ffa9e2077031e2acf2a1956e) Thanks [@cheunjm](https://github.com/cheunjm)! - Apply the container composition rule (aramiworks/conventions INF-1525) to `auth-signIn-gmailOauth`. Extract the two raw `<Text>` atoms that were leaking into the container aggregator — the "시작하기" welcome heading and the "계속하면 이용약관..." terms text — into named sub-views: `auth-signIn-gmailOauth-welcomeHeading.view.tsx` and `auth-signIn-gmailOauth-terms.view.tsx`. The container's `.views.tsx` now reads as a pure composition of named sub-views (header + welcomeHeading + signInButton + terms + loadingState + errorState). Existing `testID`s preserved on the inner `<Text>` elements so aggregator-level tests are unchanged.

- [#410](https://github.com/aramiworks/stock-tracker/pull/410) [`2dd9b3e`](https://github.com/aramiworks/stock-tracker/commit/2dd9b3e521a1d736e4852aed4e5df86c91649104) Thanks [@cheunjm](https://github.com/cheunjm)! - Apply the container composition rule (aramiworks/conventions efcv.md) to the two remaining tracker containers that had raw atoms inside `.views.tsx` aggregators.

  `tracker-watchlist-list`:
  - Extract the `Pressable` "추가" button (used as `TopAppBar.trailingContent`) into `tracker-watchlist-list-addButton.view.tsx`.

  `tracker-accounts-detail`:
  - Extract the "최근 구매" section label into `tracker-accounts-detail-recentPurchasesLabel.view.tsx`.
  - Extract the dashed "구매 추가" CTA into `tracker-accounts-detail-addPurchaseButton.view.tsx`.
  - Extract the edit/delete `Pressable`s rendered as `TopAppBar.trailingContent` into `tracker-accounts-detail-trailingActions.view.tsx` (returns null when neither handler is provided).

  Aggregator now reads as pure composition: `DetailTemplate` + `TopAppBar` + named sub-views. Aggregator-level `testID`s are preserved on the inner atoms so existing tests are unchanged. `tracker-history-browse` and `tracker-alertHistory-browse` audited and CLEAN — no changes needed.

- [#418](https://github.com/aramiworks/stock-tracker/pull/418) [`d59747e`](https://github.com/aramiworks/stock-tracker/commit/d59747ecfeef748eee8e6b557bb2583dc8eb1b78) Thanks [@cheunjm](https://github.com/cheunjm)! - Rewrite the full-stack post-deploy e2e jest suite (`apps/integration-tests/full-stack/`) for the current Hermès schema. The old suite queried Cartier-era `me`, `dashboard.totalAccounts`, `createAccount`, `accounts` — all dropped during the Hermès pivot. Subgraph-tracker logs surfaced this as `Cannot query field "me" on type "Query"` and `Did you mean "createWatch"?` once INF-1390 unblocked backend reachability. Tests [#4](https://github.com/Arami-Works/stock-tracker/issues/4) and [#5](https://github.com/Arami-Works/stock-tracker/issues/5) (createWatch round-trip) skip with a clear message when develop's `catalogList` is empty — restored once INF-1551 seeds the dev catalog. Cleanup helper switched from delete-by-prefix on `tracker_accounts` to delete-by-id on `watches` (scoped to `auth_user_id` for safety).

- [#413](https://github.com/aramiworks/stock-tracker/pull/413) [`ed31e0d`](https://github.com/aramiworks/stock-tracker/commit/ed31e0d676ba9ed44eb1cd9a8a4026bf9d926361) Thanks [@cheunjm](https://github.com/cheunjm)! - Redesign `auth-signIn-gmailOauth-header.view` per top-100-app sign-in hero patterns (Spotify, Cash App, Coinbase, Linear). Keeps the base design system color `#FF2D55` — visual lift comes from scale and typography refinement, not new palette.
  - Icon container: `96×96` (was `64×64`), `22px` radius, drop shadow (y=8, blur=16, opacity 0.18) for floating effect.
  - Icon glyph: `S` in Inter ExtraBold `48px` (was `26px`), color `#FF2D55`.
  - Title: Inter Bold `32px` (was `~28px` via `role="display" size="small"`), letter-spacing `-0.5`.
  - Subtitle: Inter Regular `14px` `white@70%`, letter-spacing `+0.4` (was `+0` `white@75%`).
  - Switches from `@aramiworks/ui` `<Text>` (Tamagui-based MD3 roles) to React Native `<Text>` with explicit styles for tighter typography control inside this sub-view.

  Figma master `auth-signIn-gmailOauth-header.view` (`852:43`) updated to match. All container variants (default/loading/error) inherit the new look via the existing INSTANCE_SWAP.

- [#432](https://github.com/aramiworks/stock-tracker/pull/432) [`1b4fe7e`](https://github.com/aramiworks/stock-tracker/commit/1b4fe7ea57575aa95fa278c91e408eee5a03b307) Thanks [@cheunjm](https://github.com/cheunjm)! - Add `scripts/e2e-seed-catalog.mjs` — REST-based one-shot to seed the Hermès reference catalog (5 watchable_units + 9 skus across Birkin / Kelly / Lindy) into a deployed Supabase project. Sister to `scripts/e2e-seed.mjs`, but separate because catalog is reference data (run once per env) and uses REST instead of Prisma (the develop pooler credentials in 1Password are stale — tracked separately on INF-1551). Idempotent — re-running is safe. Verified by running against develop and confirming the previously-skipped full-stack e2e jest tests [#4](https://github.com/Arami-Works/stock-tracker/issues/4) + [#5](https://github.com/Arami-Works/stock-tracker/issues/5) now run for real (1.4s each).

- [#436](https://github.com/aramiworks/stock-tracker/pull/436) [`a502b47`](https://github.com/aramiworks/stock-tracker/commit/a502b479eb214062c48be283cdb011cd36c1d8ad) Thanks [@cheunjm](https://github.com/cheunjm)! - Align `tracker-account-home` code to the refined Figma container variants on page `788:4`:
  - `signOutButton.view`: `Button variant="outlined" borderColor="$error" color="$error"` (was `variant="filled"` with dark-red fill). Keeps the destructive signal but quiet enough for a settings-screen footer.
  - `views.tsx`: `YStack flex={1} justifyContent="space-between"` separates the top group (account info card + sign-out) from the version footer, which now anchors to the bottom of the scroll viewport — matching Figma where the footer sits at the safe-area bottom rather than inline.
  - `versionFooter.view`: drop `flex: 1` since the parent layout now controls vertical placement; tighten to `paddingVertical: 12` + `alignItems: "center"`.

  Tests already pass without modification (assertions are testID-only and don't depend on visual layout).

- [#430](https://github.com/aramiworks/stock-tracker/pull/430) [`09036d9`](https://github.com/aramiworks/stock-tracker/commit/09036d9a2040b0ff950b8bf65d8d5d1965e2cb0a) Thanks [@cheunjm](https://github.com/cheunjm)! - Align tracker/alertHistory/browse views with Figma 623: empty state gains clipboard icon + #fafafa card + 13/[#999](https://github.com/Arami-Works/stock-tracker/issues/999) body, skeleton becomes card rows with 44px avatar + 3 stacked bars, error state is its own view with 48px blue !-icon + #0066FF retry pill.

- [#319](https://github.com/aramiworks/stock-tracker/pull/319) [`29cee19`](https://github.com/aramiworks/stock-tracker/commit/29cee19f4d0b1b7c78c1ee8ad746be6c88845770) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix createAccount FK failure by syncing auth_users on sign-in. auth_users.id is now set to the Supabase UUID so tracker_accounts.auth_user_id resolves correctly. Adds upsertUser GraphQL mutation called after sign-in to create the profile record.

- [#262](https://github.com/aramiworks/stock-tracker/pull/262) [`b7cf16f`](https://github.com/aramiworks/stock-tracker/commit/b7cf16f3a31c157b25369a0622bca557bfa9408c) Thanks [@cheunjm](https://github.com/cheunjm)! - Centralize dev ports into scripts/ports.env; mprocs.yaml and cleanup-ports.sh now read port values from a single source of truth.

- [#399](https://github.com/aramiworks/stock-tracker/pull/399) [`650ecbe`](https://github.com/aramiworks/stock-tracker/commit/650ecbee5a174f218017dfeafe0845f2ac84bc33) Thanks [@cheunjm](https://github.com/cheunjm)! - ci(chromatic): widen paths-filter to trigger on `.view.tsx` and `.views.tsx` source changes so Chromatic runs when view rendering changes, not only when story files do.

- [#313](https://github.com/aramiworks/stock-tracker/pull/313) [`ec7a15b`](https://github.com/aramiworks/stock-tracker/commit/ec7a15bba2e815c83dc74950eb5c35952b40a72e) Thanks [@cheunjm](https://github.com/cheunjm)! - Run e2e tests automatically after all deploy workflows succeed.

- [#353](https://github.com/aramiworks/stock-tracker/pull/353) [`d553013`](https://github.com/aramiworks/stock-tracker/commit/d553013118a8ecddbb490f8adc3fd0279eab7095) Thanks [@cheunjm](https://github.com/cheunjm)! - Wait for GraphQL backend to be reachable before running e2e tests to avoid transient DNS failures.

- [#284](https://github.com/aramiworks/stock-tracker/pull/284) [`e3b2083`](https://github.com/aramiworks/stock-tracker/commit/e3b208370d568c793709a83c3545158d269a0fe2) Thanks [@cheunjm](https://github.com/cheunjm)! - Enable 100% Jest coverage thresholds and fix remaining coverage gaps across all workspaces.

- [#254](https://github.com/aramiworks/stock-tracker/pull/254) [`45be8bd`](https://github.com/aramiworks/stock-tracker/commit/45be8bd5b74d9bdac11aecb591ef3835f7e94ea9) Thanks [@cheunjm](https://github.com/cheunjm)! - Wire up SA 추가하기 CTA button in accounts empty state to open the account form modal.

- [#336](https://github.com/aramiworks/stock-tracker/pull/336) [`e26c522`](https://github.com/aramiworks/stock-tracker/commit/e26c522e60766926ee8ad32eded23e6af9dd9baa) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix all changesets using invalid root package name "stock-tracker".

- [#320](https://github.com/aramiworks/stock-tracker/pull/320) [`80265d5`](https://github.com/aramiworks/stock-tracker/commit/80265d53e776e8b70158dadcee51fe43e0ea78de) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix centralize-ports changeset using invalid root package name.

- [#355](https://github.com/aramiworks/stock-tracker/pull/355) [`1136eec`](https://github.com/aramiworks/stock-tracker/commit/1136eecf4534d5ac921e4c60890e4374bc651be8) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix E2E gate check to handle workflows that didn't run for a commit.

- [#358](https://github.com/aramiworks/stock-tracker/pull/358) [`7e4d4a2`](https://github.com/aramiworks/stock-tracker/commit/7e4d4a2a3930cfa5146ca0ebd32c70d4fe2468fc) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix e2e seed using wrong FK column after supabase_id migration; extend backend health check to 180s.

- [#269](https://github.com/aramiworks/stock-tracker/pull/269) [`07ffb56`](https://github.com/aramiworks/stock-tracker/commit/07ffb562de9fc16fa2d82804a55e3cf01ed7540e) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix out-of-scope View reference in provider.test.tsx jest.mock factory.

- [#338](https://github.com/aramiworks/stock-tracker/pull/338) [`2e6d1bd`](https://github.com/aramiworks/stock-tracker/commit/2e6d1bd5e662d07b59334ad1c874e0b4d27ad43f) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix remaining changesets using deleted or non-workspace package names.

- [#253](https://github.com/aramiworks/stock-tracker/pull/253) [`a8e1018`](https://github.com/aramiworks/stock-tracker/commit/a8e10181a7a276ae0e1216dc48906390e47fca4b) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix Apollo Router JWT claims context path and propagate authorization header to subgraphs so dashboard auth works end-to-end.

- [#256](https://github.com/aramiworks/stock-tracker/pull/256) [`06429d3`](https://github.com/aramiworks/stock-tracker/commit/06429d3f3002cf2e469f566d707aa7715fd28deb) Thanks [@cheunjm](https://github.com/cheunjm)! - Wire missing handlers across all tracker containers: retry buttons, pull-to-refresh, empty state CTAs, and date filter selected state.

- [#440](https://github.com/aramiworks/stock-tracker/pull/440) [`f21d68e`](https://github.com/aramiworks/stock-tracker/commit/f21d68ebead8af0d61b1fcd407a7576c4c206e55) Thanks [@cheunjm](https://github.com/cheunjm)! - Add a views/ folder of Storybook stories for each auth/signIn/gmailOauth view (header, welcomeHeading, signInButton, terms, loadingState, errorState) and move the container Overview story to the top.

- [#276](https://github.com/aramiworks/stock-tracker/pull/276) [`a75842f`](https://github.com/aramiworks/stock-tracker/commit/a75842f1900bfac0bdd92f87acea0a4b43ff227a) Thanks [@cheunjm](https://github.com/cheunjm)! - Remove stale `url: ${MAESTRO_APP_URL}` from Maestro flow files left behind after the variable was dropped from config.yaml and sanity.yaml.

- [#243](https://github.com/aramiworks/stock-tracker/pull/243) [`4a42bd1`](https://github.com/aramiworks/stock-tracker/commit/4a42bd140ff6faba6b34dd0efa26e46c502ac775) Thanks [@cheunjm](https://github.com/cheunjm)! - Replace shared confirm-dialog and form-modal with useConfirmDialog and FullScreenDialog from @aramiworks/ui. Refactor TextInputField internals to use FormField molecule.

- [#285](https://github.com/aramiworks/stock-tracker/pull/285) [`df1e01a`](https://github.com/aramiworks/stock-tracker/commit/df1e01a54312275697ef3cc3c68290a661c83402) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate tracker-dashboard-home to TopAppBar from `@aramiworks/ui` (anchor PR for Phase 3). Bumps `@aramiworks/ui` from `^0.7.0` to `^0.9.0` to pull in the `useSafeAreaInsets` integration and `trailingContent` slot. Removes hand-rolled statusBar/appBar styles in favour of the shared organism.

- [#301](https://github.com/aramiworks/stock-tracker/pull/301) [`426a158`](https://github.com/aramiworks/stock-tracker/commit/426a158c7934994dfdd4bceaefc789ab6b0fd546) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix dev:dashboard end-to-end: downgrade @tamagui/babel-plugin to v1, simplify Metro resolver, add JWT fallback in subgraph, surface mutation errors in account form.

- [#287](https://github.com/aramiworks/stock-tracker/pull/287) [`e4b11f1`](https://github.com/aramiworks/stock-tracker/commit/e4b11f1e34385c2edfb74e085f807b8eaf3ed0d4) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate tracker-accounts-list to TopAppBar from `@aramiworks/ui` (Phase 3 follow-up to INF-1111). Removes hand-rolled statusBar/appBar styles in favour of the shared organism.

- [#289](https://github.com/aramiworks/stock-tracker/pull/289) [`1166072`](https://github.com/aramiworks/stock-tracker/commit/11660723cac8934d2e41e3a6fe822879c2caa921) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate tracker-accounts-detail to TopAppBar from `@aramiworks/ui` (Phase 3 follow-up to INF-1111). Uses `navigationIcon`/`onNavigationPress` for the back button and the new `trailingContent` slot for the 수정/삭제 text actions.

- [#310](https://github.com/aramiworks/stock-tracker/pull/310) [`9cea53b`](https://github.com/aramiworks/stock-tracker/commit/9cea53b17a506b81e648e06cf0960b5252e2fac9) Thanks [@cheunjm](https://github.com/cheunjm)! - Delete apps/api and remove all references. Auth + tracker workloads are served by apps/services/auth and apps/services/tracker (NestJS) on Railway. Drops `dev:api` script, the `api` proc in mprocs.yaml, the `api` matrix entry from `backend-docker.yml`, the `apps/api` codecov flag paths, the legacy docker-compose.yml, and the `e2e-backend.yml` workflow (replaced by the subgraph e2e job in `e2e.yml`). Subgraph Dockerfile no longer copies/builds `@stock-tracker/api`. Railway service `api` must be deleted via dashboard post-merge.

- [#290](https://github.com/aramiworks/stock-tracker/pull/290) [`212369f`](https://github.com/aramiworks/stock-tracker/commit/212369fd156a83411abebedf334a6e2f9ddbd69a) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate tracker-history-browse to TopAppBar from `@aramiworks/ui` (Phase 3 follow-up to INF-1111/INF-1121/INF-1123). Replaces the ad-hoc StatusBar/AppBar/Text construction with a single `TopAppBar type="small"` — title-only, no back button or trailing actions.

- [#294](https://github.com/aramiworks/stock-tracker/pull/294) [`565a9b9`](https://github.com/aramiworks/stock-tracker/commit/565a9b964a38f29db08f97b33730796c0f6560ca) Thanks [@cheunjm](https://github.com/cheunjm)! - Replace inline FullScreenDialog in tracker-accountFormModal with the published @aramiworks/ui FullScreenDialog (Phase 4a).

- [#295](https://github.com/aramiworks/stock-tracker/pull/295) [`7ffebb7`](https://github.com/aramiworks/stock-tracker/commit/7ffebb706596c3f321110fd0e863890b46c40ab4) Thanks [@cheunjm](https://github.com/cheunjm)! - Replace inline FullScreenDialog in tracker-accounts-detail-purchaseFormModal with the published @aramiworks/ui FullScreenDialog (Phase 4b).

- [#297](https://github.com/aramiworks/stock-tracker/pull/297) [`51f80c7`](https://github.com/aramiworks/stock-tracker/commit/51f80c7f81928e44a3e2a297434ab42f192272cd) Thanks [@cheunjm](https://github.com/cheunjm)! - Replace inline FullScreenDialog in tracker-accounts-detail-editAccountModal with the published @aramiworks/ui FullScreenDialog (Phase 4c).

- [#299](https://github.com/aramiworks/stock-tracker/pull/299) [`f00c372`](https://github.com/aramiworks/stock-tracker/commit/f00c37203f5b48da34fe9d705f95de9911d289ff) Thanks [@cheunjm](https://github.com/cheunjm)! - Replace Alert.alert delete confirmation in tracker-accounts-list with @aramiworks/ui useConfirmDialog (Phase 4d).

- [#302](https://github.com/aramiworks/stock-tracker/pull/302) [`ff5b940`](https://github.com/aramiworks/stock-tracker/commit/ff5b94075a003402bf267be3e898b9c0a405e2e9) Thanks [@cheunjm](https://github.com/cheunjm)! - Replace Alert.alert delete confirmation in tracker-history-browse with @aramiworks/ui useConfirmDialog (Phase 4e).

- [#304](https://github.com/aramiworks/stock-tracker/pull/304) [`b0ccf3b`](https://github.com/aramiworks/stock-tracker/commit/b0ccf3bff1465e69631d440c811f303f76a0c348) Thanks [@cheunjm](https://github.com/cheunjm)! - Replace 2× Alert.alert delete confirmations in tracker-accounts-detail with @aramiworks/ui useConfirmDialog (Phase 4f, completes Phase 4 migration).

- [#308](https://github.com/aramiworks/stock-tracker/pull/308) [`baf5960`](https://github.com/aramiworks/stock-tracker/commit/baf5960f71dd379e352dbd8022128afe966b0524) Thanks [@cheunjm](https://github.com/cheunjm)! - Replace Alert.alert error toast in TrackerAccountFormModalView with @aramiworks/ui Snackbar.

- [#323](https://github.com/aramiworks/stock-tracker/pull/323) [`ca7d4aa`](https://github.com/aramiworks/stock-tracker/commit/ca7d4aad8e99c99a83dca69e3a11425b9026c53b) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate tracker-dashboard-home-saCard to Card atom from @aramiworks/ui (Phase 5a). Replaces raw Pressable + StyleSheet wrapper with elevated Card variant and refactors the inner absolute layout to XStack + YStack.

- [#326](https://github.com/aramiworks/stock-tracker/pull/326) [`f985a1d`](https://github.com/aramiworks/stock-tracker/commit/f985a1d9162761d9ab383a0fe38e1b724e20df99) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate tracker-dashboard-home-spendSummaryCard to Card atom from @aramiworks/ui (Phase 5b). Replaces raw View + StyleSheet wrapper with elevated Card variant and refactors the inner absolute layout to flex (XStack + YStack).

- [#339](https://github.com/aramiworks/stock-tracker/pull/339) [`b5004c5`](https://github.com/aramiworks/stock-tracker/commit/b5004c5859084a0c12b28292a0715472a02ae84d) Thanks [@cheunjm](https://github.com/cheunjm)! - Define `stocktracker` 7-agent team in `.claude/agents/` and `.claude/teams/stocktracker/README.md` so future Claude Code sessions can spawn the team via `subagent_type: stocktracker-<role>` without re-deriving charters.

- [#341](https://github.com/aramiworks/stock-tracker/pull/341) [`d067b4b`](https://github.com/aramiworks/stock-tracker/commit/d067b4b9cf16f172c31379c62f757dc47813479f) Thanks [@cheunjm](https://github.com/cheunjm)! - Adjust `claude-respond.yml` concurrency: drop unused `pull_request` triggers and set `cancel-in-progress: false` so back-to-back PR-review-response runs queue instead of cancelling each other.

- [#371](https://github.com/aramiworks/stock-tracker/pull/371) [`9c7a4d6`](https://github.com/aramiworks/stock-tracker/commit/9c7a4d65fb8c98f655d1c3396024dbacd7f926bc) Thanks [@cheunjm](https://github.com/cheunjm)! - Add tracker/account flow with account info screen and profile-avatar entry in alerts header.

- [#374](https://github.com/aramiworks/stock-tracker/pull/374) [`e692401`](https://github.com/aramiworks/stock-tracker/commit/e692401094af9b058525c64595188bea52e7a5b8) Thanks [@cheunjm](https://github.com/cheunjm)! - Add Maestro E2E flow for tracker-account-home container.

- [#367](https://github.com/aramiworks/stock-tracker/pull/367) [`8d42290`](https://github.com/aramiworks/stock-tracker/commit/8d42290bc5271a4c5f74dd2eb8a6d39eaee767b8) Thanks [@cheunjm](https://github.com/cheunjm)! - Hand-edit `ko/auth.json` with the Korean copy for the auth-signIn-gmailOauth screen and its loading/error states (INF-1343). Defers the Ditto pipeline — JSON files are now the i18n source of truth until we resume the Ditto workflow.

- [#378](https://github.com/aramiworks/stock-tracker/pull/378) [`7edf64f`](https://github.com/aramiworks/stock-tracker/commit/7edf64fdf6c24699d92b0b8be8c40f35d12b361f) Thanks [@cheunjm](https://github.com/cheunjm)! - Split `auth-signIn-gmailOauth` views into per-component_set files (signInButton, loadingState, errorState) to match the EFCV/MCVL sub-view-per-file pattern used in `tracker` containers.

- [#368](https://github.com/aramiworks/stock-tracker/pull/368) [`2d982af`](https://github.com/aramiworks/stock-tracker/commit/2d982afb1daf1037af5a8cf29e92797216db6da2) Thanks [@cheunjm](https://github.com/cheunjm)! - Update CLAUDE.md experience table for Shengsho UX pivot: tracker flows are now `catalog` / `watchlist` / `alertHistory` (was `alerts` / `watchlist` / `history`).

- [#391](https://github.com/aramiworks/stock-tracker/pull/391) [`b92b488`](https://github.com/aramiworks/stock-tracker/commit/b92b488f059de00b3508faa4ec4534009ae11b96) Thanks [@cheunjm](https://github.com/cheunjm)! - Hotfix the TypeScript regression introduced by PR [#388](https://github.com/Arami-Works/stock-tracker/issues/388) (INF-1414): drop the legacy `tracker-accounts-list/` family that still pushed to the deleted `/tracker/accounts/detail/[id]` route, and point the parked alerts/home dashboard `onSaPress` at the new flat `/tracker/watchlist` route. Swap the watchlist list + detail controllers from in-memory mocks to the protected `watchlist` / `watchlistDetail` GraphQL queries landed by INF-1415.

- [#257](https://github.com/aramiworks/stock-tracker/pull/257) [`93607a4`](https://github.com/aramiworks/stock-tracker/commit/93607a462ae1641c230c739e3712eadfaeda7d2b) Thanks [@cheunjm](https://github.com/cheunjm)! - Add jest coverage configs and consolidate codecov configuration.

- [#372](https://github.com/aramiworks/stock-tracker/pull/372) [`a260795`](https://github.com/aramiworks/stock-tracker/commit/a2607951f60f19114136c02c6fe3b5af6edfec26) Thanks [@cheunjm](https://github.com/cheunjm)! - Add Maestro flow `tracker-tab-navigation.yaml` covering the three live bottom tabs (alerts, watchlist, history). Sign-out and watchlist-detail deep-link flows from INF-1342 deferred — see issue comment for blockers (no sign-out UI yet, seed lacks stable account id).

- [#364](https://github.com/aramiworks/stock-tracker/pull/364) [`c943371`](https://github.com/aramiworks/stock-tracker/commit/c943371f317a7c63e37f5eaa20edae0dc974e113) Thanks [@cheunjm](https://github.com/cheunjm)! - Replace old Cartier-era Maestro flows with baseline e2e structure and sign-in flow.

- [#359](https://github.com/aramiworks/stock-tracker/pull/359) [`9fbce1b`](https://github.com/aramiworks/stock-tracker/commit/9fbce1b462cacd51992650a40c629ab8937f54b8) Thanks [@cheunjm](https://github.com/cheunjm)! - Rename Maestro flow files to match EFCV container component naming (`{exp}-{flow}-{container}.yaml`); fix `alerts` container row in CLAUDE.md (`feed` → `home`).

- [#325](https://github.com/aramiworks/stock-tracker/pull/325) [`3329434`](https://github.com/aramiworks/stock-tracker/commit/3329434c6ef964d3b9e1ac5fe902ac658d62912f) Thanks [@cheunjm](https://github.com/cheunjm)! - Add takeScreenshot steps to all Maestro e2e flows for visual test artifacts.

- [#335](https://github.com/aramiworks/stock-tracker/pull/335) [`a50afe3`](https://github.com/aramiworks/stock-tracker/commit/a50afe38188ff397827ff7c2be4d1e2dd51ecb9d) Thanks [@cheunjm](https://github.com/cheunjm)! - Migrate tracker-accounts-list-saListItem view to use Card atom from @aramiworks/ui (variant=elevated), with onPress and onLongPress wired through.

- [#283](https://github.com/aramiworks/stock-tracker/pull/283) [`c2b5b71`](https://github.com/aramiworks/stock-tracker/commit/c2b5b711aff05df9aebd2500eeb13574f56823cd) Thanks [@cheunjm](https://github.com/cheunjm)! - Add unit tests for all container and view components (Phase 5i-l).

- [#280](https://github.com/aramiworks/stock-tracker/pull/280) [`34e57c6`](https://github.com/aramiworks/stock-tracker/commit/34e57c67113c8354e848df4fdbdb48ead4b04e05) Thanks [@cheunjm](https://github.com/cheunjm)! - Add unit tests for all 11 controller components (Phase 5h).

- [#268](https://github.com/aramiworks/stock-tracker/pull/268) [`1504d4e`](https://github.com/aramiworks/stock-tracker/commit/1504d4e7aaccdd1bc229a71b1004010bde9ed508) Thanks [@cheunjm](https://github.com/cheunjm)! - Add unit tests for mobile lib modules (apollo, supabase, i18n, tamagui).

- [#273](https://github.com/aramiworks/stock-tracker/pull/273) [`218709f`](https://github.com/aramiworks/stock-tracker/commit/218709fef8a094264de14c8a37aee9bd603489aa) Thanks [@cheunjm](https://github.com/cheunjm)! - Add unit tests for all lifecycle hooks and model components (Phase 5f-g).

- [#266](https://github.com/aramiworks/stock-tracker/pull/266) [`dd3b364`](https://github.com/aramiworks/stock-tracker/commit/dd3b364b128368ee5db056cc03b4137e1eee1303) Thanks [@cheunjm](https://github.com/cheunjm)! - Add test infrastructure (setup mocks, test utils) and initial unit tests for stores, hooks, and shared components.

- [#405](https://github.com/aramiworks/stock-tracker/pull/405) [`e81cf36`](https://github.com/aramiworks/stock-tracker/commit/e81cf363d3164fed1516f7e1f4aa6f9652d6187f) Thanks [@cheunjm](https://github.com/cheunjm)! - Add per-Container Sentry error boundaries. Render errors inside any Container are now reported to Sentry with EFCV tags and the user sees the Container's error state instead of an app-wide unmount.

- [#366](https://github.com/aramiworks/stock-tracker/pull/366) [`e1150be`](https://github.com/aramiworks/stock-tracker/commit/e1150be190bbe6ae2c5f5ffb71dc8b45186eb3e0) Thanks [@cheunjm](https://github.com/cheunjm)! - Document Maestro flow naming conventions and known E2E coverage gaps (INF-1330) in the stocktracker-qa agent charter.

- [#345](https://github.com/aramiworks/stock-tracker/pull/345) [`5cede57`](https://github.com/aramiworks/stock-tracker/commit/5cede57911bb7064eec7c3f0fc0d303156d96a71) Thanks [@cheunjm](https://github.com/cheunjm)! - Refactor TrackerSkeletonCardView to use Card atom (variant=filled). Drop fixed width/height props in favor of children-based composition; update wrappers and dashboard to compose internal skeleton bars matching real card shapes.

- [#329](https://github.com/aramiworks/stock-tracker/pull/329) [`ad98d46`](https://github.com/aramiworks/stock-tracker/commit/ad98d461f2fa17c357f574a9633efee98c3b8378) Thanks [@cheunjm](https://github.com/cheunjm)! - Remove no-op takeScreenshot commands from Maestro flows; not supported by web/chromium driver.

- [#306](https://github.com/aramiworks/stock-tracker/pull/306) [`c9cf889`](https://github.com/aramiworks/stock-tracker/commit/c9cf88935e2d62630489e48fd37df83a372185dd) Thanks [@cheunjm](https://github.com/cheunjm)! - Remove @tamagui/babel-plugin from babel config — static analysis fails at runtime due to @tamagui/core ESM-only package.

- [#312](https://github.com/aramiworks/stock-tracker/pull/312) [`78e0941`](https://github.com/aramiworks/stock-tracker/commit/78e09416dc29712f1ff3633cf4ca7b0a7df1c40b) Thanks [@cheunjm](https://github.com/cheunjm)! - Add Apollo Router integration tests covering JWKS validation, Rhai JWT-claim header mapping, and supergraph composition. New workspace `apps/integration-tests/router` runs the real `apollo-router` binary (v2.10.0, matching `apps/router/Dockerfile`) against a mock federated subgraph; reuses the production `apps/router/router.yaml` and `apps/router/rhai/main.rhai` verbatim.

  The suite caught a real bug on its first run: the Rhai script was writing JWT claims to `request.headers` (the originating supergraph request, which is read-only in `subgraph_service` in Router v2.x). Assignments were silently ignored, so `x-user-id` and `x-user-role` never reached the subgraph. Fixed by switching to `request.subgraph.headers`.

- [#301](https://github.com/aramiworks/stock-tracker/pull/301) [`426a158`](https://github.com/aramiworks/stock-tracker/commit/426a158c7934994dfdd4bceaefc789ab6b0fd546) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix JWT claim forwarding in Apollo Router using Rhai script instead of broken from_context paths.

- [#421](https://github.com/aramiworks/stock-tracker/pull/421) [`1367201`](https://github.com/aramiworks/stock-tracker/commit/13672018b21738cd996b88ef8fc73125b78b66f2) Thanks [@cheunjm](https://github.com/cheunjm)! - Add Sentry's React Navigation integration so screen transitions produce performance transactions and navigation breadcrumbs. `enableTimeToInitialDisplay` is on. The root layout registers the navigation container ref on mount.

- [#419](https://github.com/aramiworks/stock-tracker/pull/419) [`be23d15`](https://github.com/aramiworks/stock-tracker/commit/be23d1578f79dd9bcba7773aa45ebd299117cca9) Thanks [@cheunjm](https://github.com/cheunjm)! - Tag Sentry events with `release` (version+build), `dist` (build number), and `environment` (`EXPO_PUBLIC_APP_ENV`). Events now line up with the source maps the `@sentry/react-native/expo` plugin uploads, and develop/stage/master events are filterable in Sentry.

- [#416](https://github.com/aramiworks/stock-tracker/pull/416) [`31f8f8c`](https://github.com/aramiworks/stock-tracker/commit/31f8f8cbb1c9af346572daccea0bd2cc22873e1a) Thanks [@cheunjm](https://github.com/cheunjm)! - Tag Sentry events and Session Replays with the authenticated user's stable id. `identifySentryUser` is called on session rehydration and on `SIGNED_IN`/token refresh; `resetSentryUser` clears the context on `SIGNED_OUT` so subsequent anonymous events aren't mis-attributed.

- [#443](https://github.com/aramiworks/stock-tracker/pull/443) [`dd3166b`](https://github.com/aramiworks/stock-tracker/commit/dd3166bbf5c23cd99ceb2943b3de8507db2258b8) Thanks [@cheunjm](https://github.com/cheunjm)! - Apply the container-Overview + views/ Storybook convention across all stories: container stories now lead with an Overview (mandatory, first) covering every screen state; view stories move under a `/views/` title segment (no `.view` suffix) and drop their Overview (Overview is container-only). Shared views retitle to `tracker/views/*`, and the redundant `tracker/watchlist/detail.views` story folds into the container story.

- [#265](https://github.com/aramiworks/stock-tracker/pull/265) [`8021ea3`](https://github.com/aramiworks/stock-tracker/commit/8021ea376d1954e770e78033e34913926c069a45) Thanks [@cheunjm](https://github.com/cheunjm)! - Fix Tamagui "Can't find configuration" runtime error by pinning web/react-native-web-lite/react-native-web-internals to root v1 copies via Metro resolveRequest intercept.

- [#274](https://github.com/aramiworks/stock-tracker/pull/274) [`d909936`](https://github.com/aramiworks/stock-tracker/commit/d909936d0eb6de5e90a16d5cce452a6f4c52252f) Thanks [@cheunjm](https://github.com/cheunjm)! - Tighten Codecov project threshold from 2% to 0% for strict coverage enforcement.

- [#392](https://github.com/aramiworks/stock-tracker/pull/392) [`01d67f5`](https://github.com/aramiworks/stock-tracker/commit/01d67f5c54564df7faddcb03803f532ea74ee9b0) Thanks [@cheunjm](https://github.com/cheunjm)! - Align tracker/watchlist/list views with Figma 845: red "+ 추가" header action, [#808080](https://github.com/Arami-Works/stock-tracker/issues/808080) row chevron, and full empty-state redesign (circular icon, 17pt title, 160×44 #ff2d55 pill CTA).

- Updated dependencies [[`6591e72`](https://github.com/aramiworks/stock-tracker/commit/6591e722e32b0ffff562371f250e795aa308ce77), [`9c5aa00`](https://github.com/aramiworks/stock-tracker/commit/9c5aa002d76587ccf7b7b7e1243e6dd9d056d6c9), [`70c57c6`](https://github.com/aramiworks/stock-tracker/commit/70c57c6dc15cd837f03c6b79065bf5cd2d93013a), [`eedeffa`](https://github.com/aramiworks/stock-tracker/commit/eedeffae9416f5741e1105fb8c37abba60523b05), [`6579aae`](https://github.com/aramiworks/stock-tracker/commit/6579aaef986590746b511200450c42585432de6a), [`9925c4b`](https://github.com/aramiworks/stock-tracker/commit/9925c4b5c5eda47122651b79f9634a6fe28b2f61), [`dc5d6bb`](https://github.com/aramiworks/stock-tracker/commit/dc5d6bbee0b5ace9f7cd4c2142afc1a617e474a1), [`f53668c`](https://github.com/aramiworks/stock-tracker/commit/f53668c38c4b27f3a2132ba536b62da9fb5fcc8a), [`8972c3c`](https://github.com/aramiworks/stock-tracker/commit/8972c3c3a89e2dab47c079fa902ab6e240721807), [`9563de7`](https://github.com/aramiworks/stock-tracker/commit/9563de7eb8b505510c4292fc53eb503843247e5d), [`2a355f2`](https://github.com/aramiworks/stock-tracker/commit/2a355f24df5e693b1a92465e37995d2bfd23fc14), [`2b3c328`](https://github.com/aramiworks/stock-tracker/commit/2b3c3284e8bcc7a4f78880a809ab8c6127fdebb1), [`f7cf9d9`](https://github.com/aramiworks/stock-tracker/commit/f7cf9d9deb429980ac3889c8bc5198b254acc682), [`22bec75`](https://github.com/aramiworks/stock-tracker/commit/22bec755dd4be862132ad59be13959cd245c6c12), [`ed520f3`](https://github.com/aramiworks/stock-tracker/commit/ed520f37f1a603d1d480b147c9aa39d0a99416d3), [`464a152`](https://github.com/aramiworks/stock-tracker/commit/464a1529ecdd8934a818c3841c47d4a509999540), [`59723a8`](https://github.com/aramiworks/stock-tracker/commit/59723a81a52679379cd743d750f972686a38c679), [`3546e4c`](https://github.com/aramiworks/stock-tracker/commit/3546e4cd2c97447eb7fecc1b0df8ea699b0ce36f), [`a4f3d85`](https://github.com/aramiworks/stock-tracker/commit/a4f3d85ee7cc025990cc2a7266c36e1b3139b6e2), [`e66ed9a`](https://github.com/aramiworks/stock-tracker/commit/e66ed9a1d677838fa935b7015af29e0930a98f36), [`9cfbc48`](https://github.com/aramiworks/stock-tracker/commit/9cfbc48164fbbb11cf6455ca6a72a4f9ceb6eb11), [`0fc9d4f`](https://github.com/aramiworks/stock-tracker/commit/0fc9d4f532c2900eacb64c43fe42b65a902d07fc)]:
  - @stock-tracker/validation@0.1.0
  - @stock-tracker/config@0.1.0
  - @stock-tracker/types@0.1.0
