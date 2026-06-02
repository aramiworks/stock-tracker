---
"@stock-tracker/mobile": minor
---

Migrate hardcoded `#FF2D55` (Cartier red) across stock-tracker mobile to `colors.primary` from `@aramiworks/ui` (`#0066FF`). The mobile app now uses the design system's primary token everywhere a brand accent was previously hardcoded. Figma file `MSJ05A0BXBDTO0powtUMg3` updated to match — 78 SOLID fills/strokes across 6 pages (tracker experience, catalog browse, watchlist list/detail, alertHistory browse).

Changes:

- Brand accents (chips, CTAs, accents in `tracker-history-browse-{date,category}FilterChips`, `tracker-accounts-detail-{addPurchaseButton,trailingActions,saHeader}`, `tracker-dashboard-home-{saCard,spendSummaryCard}`, `tracker-watchlist-list-{addButton,emptyState}`) → `colors.primary`.
- Warning-state indicators (`tracker-eligibilityBadge.view` notEligible, `tracker-errorState.view` error icon, `tracker-dashboard-home-saCard.view` notEligible status) → `stateColors.red` (`#FF3B30` iOS systemRed) instead of brand red.
- Soft pink avatar backgrounds (`#FFE8ED`) on `tracker-dashboard-home-saCard.view` and `tracker-accounts-detail-saHeader.view` → soft blue (`#E5EEFF`) to pair with the new primary.
- `app.config.ts` Android adaptive icon background `#FF2D55` → `#0066FF`.
- `state.ts` `red` value changed from `#ff2d55` to `#FF3B30` (iOS systemRed) so the warning red is visually distinct from the new brand primary.
- `state.test.ts` updated to match.
- `CLAUDE.md` Design section updated — Primary is now `colors.primary` from `@aramiworks/ui` (`#0066FF`), no longer Cartier red.
- `src/setup.ts` Jest mock for `@aramiworks/ui` extended with a `colors` token export so component tests resolve `colors.primary` at runtime.

Auth-flow files (`auth-signIn-gmailOauth.views.tsx`, `auth-signIn-gmailOauth-header.view.tsx`, `auth-signIn-gmailOauth-errorState.view.tsx`) are out of scope here — they're already migrated in PR #413.
