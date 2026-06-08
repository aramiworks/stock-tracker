---
"@stock-tracker/mobile": minor
---

Add restock push notifications on mobile: register/unregister the device's Expo
push token around login/logout, foreground + cold-start notification handlers
that deep-link to the watchlist detail, and a `useRefetchOnRestock` event seam
that refreshes open watchlist screens live when a restock push arrives.
