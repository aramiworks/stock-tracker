---
"@stock-tracker/auth-service": patch
"@stock-tracker/tracker-service": patch
---

Add auth-service (port 4030) and tracker-service (port 4020) to GHCR build matrix and Railway service config. Parameterize `infra/docker/node-service.Dockerfile` with `ARG ENTRYPOINT_FILE` so NestJS services run `dist/main.js`. Additive — `apps/api` remains in place; subgraph traffic still points at it.
