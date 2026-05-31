---
"@stock-tracker/mobile": minor
---

Wire `signInError` into the auth-signIn-gmailOauth controller so the error view (already in code, Figma, and Storybook from INF-1435) renders at runtime when sign-in fails. Adds `signInError: boolean` to `AuthSignInGmailOauthControllersOutput` — cleared at the start of every `signInWithGoogle` call and the web auth-session response handler, set to `true` inside each sign-in catch block. Views derive `screenState = "error"` when `signInError` is true (preferred over `loading` when both flags coincide). The container's `ConnectedViews` passes `onRetry={signInWithGoogle}` so tapping "다시 시도" retries.
