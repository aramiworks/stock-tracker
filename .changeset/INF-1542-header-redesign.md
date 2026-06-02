---
"@stock-tracker/mobile": patch
---

Redesign `auth-signIn-gmailOauth-header.view` per top-100-app sign-in hero patterns (Spotify, Cash App, Coinbase, Linear). Keeps the base design system color `#FF2D55` — visual lift comes from scale and typography refinement, not new palette.

- Icon container: `96×96` (was `64×64`), `22px` radius, drop shadow (y=8, blur=16, opacity 0.18) for floating effect.
- Icon glyph: `S` in Inter ExtraBold `48px` (was `26px`), color `#FF2D55`.
- Title: Inter Bold `32px` (was `~28px` via `role="display" size="small"`), letter-spacing `-0.5`.
- Subtitle: Inter Regular `14px` `white@70%`, letter-spacing `+0.4` (was `+0` `white@75%`).
- Switches from `@aramiworks/ui` `<Text>` (Tamagui-based MD3 roles) to React Native `<Text>` with explicit styles for tighter typography control inside this sub-view.

Figma master `auth-signIn-gmailOauth-header.view` (`852:43`) updated to match. All container variants (default/loading/error) inherit the new look via the existing INSTANCE_SWAP.
