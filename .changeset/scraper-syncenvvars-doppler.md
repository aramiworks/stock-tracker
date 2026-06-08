---
"@stock-tracker/scraper": patch
---

Sync the deployed scraper's env from Doppler at deploy time via a `syncEnvVars` build extension (pulls the config the deploy's `DOPPLER_TOKEN` is scoped to), making Doppler the single source of truth for Trigger.dev env — including `TRACKER_INGEST_SERVICE_TOKEN` + `TRACKER_INGEST_URL`. Also adds the now-required `maxDuration` config option.
