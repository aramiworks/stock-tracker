import type { EfcvTags } from "./get-efcv-from-route";

/**
 * Module-level cache of the latest EFCV tags from Expo Router.
 *
 * Sentry's `beforeSend` hook runs synchronously outside React, so it cannot
 * call `useSegments()` directly. The `<SentryEfcvTracker />` component
 * subscribes to segments and writes here; `beforeSend` reads.
 */

let current: EfcvTags = {};

export function setCurrentEfcv(efcv: EfcvTags): void {
  current = efcv;
}

export function getCurrentEfcv(): EfcvTags {
  return current;
}
