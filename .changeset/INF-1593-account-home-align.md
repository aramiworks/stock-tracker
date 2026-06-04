---
"@stock-tracker/mobile": patch
---

Align `tracker-account-home` code to the refined Figma container variants on page `788:4`:

- `signOutButton.view`: `Button variant="outlined" borderColor="$error" color="$error"` (was `variant="filled"` with dark-red fill). Keeps the destructive signal but quiet enough for a settings-screen footer.
- `views.tsx`: `YStack flex={1} justifyContent="space-between"` separates the top group (account info card + sign-out) from the version footer, which now anchors to the bottom of the scroll viewport — matching Figma where the footer sits at the safe-area bottom rather than inline.
- `versionFooter.view`: drop `flex: 1` since the parent layout now controls vertical placement; tighten to `paddingVertical: 12` + `alignItems: "center"`.

Tests already pass without modification (assertions are testID-only and don't depend on visual layout).
