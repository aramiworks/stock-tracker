---
"@stock-tracker/mobile": patch
---

Tag Sentry events with `release` (version+build), `dist` (build number), and `environment` (`EXPO_PUBLIC_APP_ENV`). Events now line up with the source maps the `@sentry/react-native/expo` plugin uploads, and develop/stage/master events are filterable in Sentry.
