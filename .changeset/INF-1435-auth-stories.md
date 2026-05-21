---
"@stock-tracker/mobile": minor
---

Refactor `auth-signIn-gmailOauth` container views to match the new Figma design (red brand hero + white rounded card split layout). Add a Storybook story (`auth/signIn/gmailOauth`) with `Default`, `Loading`, `Error`, and `Overview` variants. The views now accept a `screenState` prop (`"default" | "loading" | "error"`); when omitted they derive from the controller's `isSigningIn` (default behaviour preserved). Adds new `auth-signIn-gmailOauth-header.view` (brand hero), wires the existing `errorState` view into the screenState dispatch, and updates `loadingState`/`errorState` text colors for the new white-card background.
