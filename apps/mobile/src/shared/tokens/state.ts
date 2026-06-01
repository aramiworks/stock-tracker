/**
 * Watchable-state semantic colors used by the watchlist + alert-history surfaces.
 *
 * These map the four `WatchableState` / event-kind values onto the design hand-off
 * indicators (Figma 845-2 / 845-69 / 846-2 for watchlist; 623:1129 / 623:1150 /
 * 623:1183 for alertHistory). They also back the two drop-event kinds on the
 * detail history row (`restocked` → green, `out_of_stock` → red).
 *
 *   green  — iOS systemGreen, used as the "in-stock" / "restocked" indicator
 *   red    — iOS systemRed, used as "out-of-stock" / negative state indicator
 *            (distinct from brand primary, which is `colors.primary` from @aramiworks/ui)
 *   muted  — neutral grey, used when the scraper hasn't reported yet
 *   teal   — secondary accent (`#009E99`), used as the alertHistory soldOut
 *            left-indicator bar (design hand-off INF-1478, frame 623:1129)
 */
export const stateColors = {
  green: "#34c759",
  red: "#FF3B30",
  muted: "#808080",
  teal: "#009E99",
} as const;

export type StateColor = keyof typeof stateColors;
