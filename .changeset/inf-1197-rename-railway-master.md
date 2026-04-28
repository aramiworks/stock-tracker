---
"@stock-tracker/subgraph-tracker": patch
---

Rename Railway `production` environment to `master` to align with Doppler's `master` config and the project's single-trunk convention. Updates `infra/railway/` env keys (`production` → `master`), the `setup:production` script, `redeploy.ts` usage doc, the GitHub workflow dropdowns in `backend-docker.yml` and `schema-publish.yml`, and the deployment table in `CLAUDE.md`. No infra changes required — the Railway env was already renamed in the dashboard.
