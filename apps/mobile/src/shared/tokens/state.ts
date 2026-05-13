/**
 * Watchable-state semantic colors used by the watchlist surfaces.
 *
 * These map the three `WatchableState` values onto the design hand-off
 * indicators (Figma 845-2 / 845-69 / 846-2). They also back the two
 * drop-event kinds on the detail history row (`restocked` → green,
 * `out_of_stock` → red).
 *
 *   green  — iOS systemGreen, used as the "in-stock" / "restocked" indicator
 *   red    — Cartier red (also the app's primary), used as "out-of-stock"
 *   muted  — neutral grey, used when the scraper hasn't reported yet
 */
export const stateColors = {
  green: "#34c759",
  red: "#ff2d55",
  muted: "#808080",
} as const;

export type StateColor = keyof typeof stateColors;
