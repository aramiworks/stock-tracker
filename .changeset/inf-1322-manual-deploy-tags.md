---
"@stock-tracker/railway-infra": patch
---

Make backend Docker publishing manual-only and rename master image tag from `latest` to `master`.

- Drop `push: main` trigger from `backend-docker.yml` — every backend deploy now goes through `workflow_dispatch`.
- Fix the dispatch dropdown: `staging` → `stage` (matches Railway env name, Doppler config, and `infra/railway/src/config.ts`).
- Switch master `imageTag` from `latest` to `master` so all three envs follow the same `:{env}` convention (`:develop`, `:stage`, `:master`).
- Mirror the `staging` → `stage` rename in `schema-publish.yml`.
- Update `CLAUDE.md` deployment table to reflect manual-only flow.
