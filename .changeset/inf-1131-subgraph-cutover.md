---
"@stock-tracker/subgraph-tracker": patch
"@stock-tracker/auth-service": patch
"@stock-tracker/tracker-service": patch
---

Cut subgraph-tracker over to auth-service (port 4030) and tracker-service (port 4020) on Railway. Subgraph now reads `TRPC_AUTH_SERVICE_URL` + `TRPC_TRACKER_SERVICE_URL` instead of the legacy `TRPC_SERVICE_URL` (apps/api). Adds `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` to tracker-service envVars (required by `baseEnvSchema`). Doppler develop/stage/master synced with the new env vars.
