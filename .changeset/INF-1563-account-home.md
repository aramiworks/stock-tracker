---
"@stock-tracker/mobile": minor
---

Bring `tracker-account-home` up to the canonical container pattern established by `tracker-dashboard-home` and `auth-signIn-gmailOauth`.

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
