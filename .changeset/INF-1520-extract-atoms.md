---
"@stock-tracker/mobile": patch
---

Apply the container composition rule (aramiworks/conventions INF-1525) to `auth-signIn-gmailOauth`. Extract the two raw `<Text>` atoms that were leaking into the container aggregator — the "시작하기" welcome heading and the "계속하면 이용약관..." terms text — into named sub-views: `auth-signIn-gmailOauth-welcomeHeading.view.tsx` and `auth-signIn-gmailOauth-terms.view.tsx`. The container's `.views.tsx` now reads as a pure composition of named sub-views (header + welcomeHeading + signInButton + terms + loadingState + errorState). Existing `testID`s preserved on the inner `<Text>` elements so aggregator-level tests are unchanged.
