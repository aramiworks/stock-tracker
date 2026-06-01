---
"@stock-tracker/mobile": patch
---

Apply the container composition rule (aramiworks/conventions efcv.md) to the two remaining tracker containers that had raw atoms inside `.views.tsx` aggregators.

`tracker-watchlist-list`:

- Extract the `Pressable` "추가" button (used as `TopAppBar.trailingContent`) into `tracker-watchlist-list-addButton.view.tsx`.

`tracker-accounts-detail`:

- Extract the "최근 구매" section label into `tracker-accounts-detail-recentPurchasesLabel.view.tsx`.
- Extract the dashed "구매 추가" CTA into `tracker-accounts-detail-addPurchaseButton.view.tsx`.
- Extract the edit/delete `Pressable`s rendered as `TopAppBar.trailingContent` into `tracker-accounts-detail-trailingActions.view.tsx` (returns null when neither handler is provided).

Aggregator now reads as pure composition: `DetailTemplate` + `TopAppBar` + named sub-views. Aggregator-level `testID`s are preserved on the inner atoms so existing tests are unchanged. `tracker-history-browse` and `tracker-alertHistory-browse` audited and CLEAN — no changes needed.
