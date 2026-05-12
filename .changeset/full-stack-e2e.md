---
"@stock-tracker/subgraph-tracker": patch
---

Add post-deploy full-stack e2e suite (`apps/integration-tests/full-stack`) that hits the deployed develop Apollo Router with a real Supabase JWT and verifies the chain (Router → Subgraph → tRPC services → Prisma → Postgres). Replaces the misnamed hermetic `e2e-backend` job in `e2e.yml` (which duplicated `e2e-subgraph.yml`) with a deployed-stack smoke that runs after all four deploy workflows succeed.
