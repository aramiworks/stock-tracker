---
"@stock-tracker/subgraph-tracker": patch
"@stock-tracker/mobile": patch
---

Delete apps/api and remove all references. Auth + tracker workloads are served by apps/services/auth and apps/services/tracker (NestJS) on Railway. Drops `dev:api` script, the `api` proc in mprocs.yaml, the `api` matrix entry from `backend-docker.yml`, the `apps/api` codecov flag paths, the legacy docker-compose.yml, and the `e2e-backend.yml` workflow (replaced by the subgraph e2e job in `e2e.yml`). Subgraph Dockerfile no longer copies/builds `@stock-tracker/api`. Railway service `api` must be deleted via dashboard post-merge.
