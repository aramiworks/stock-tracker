---
"@stock-tracker/subgraph-tracker": patch
"@stock-tracker/router": patch
"@stock-tracker/prisma": patch
"@stock-tracker/mobile": patch
"@stock-tracker/config": patch
---

Fix apiHandle leak in subgraph test helpers; activate Rhai plugin in router config with corrected JWT claims context key and remove duplicate YAML header injection; align init migration FK to reference auth_users.supabase_id.; fix ESM Sentry auto-instrumentation by moving instrument.ts to --import Node.js flag; rename opaque SaSkeleton story helper to AvatarLineSkeleton for clarity; normalise BETTER_STACK_INGEST_HOST to avoid double-protocol endpoint.
