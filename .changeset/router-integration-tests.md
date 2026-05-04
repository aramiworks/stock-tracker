---
"@stock-tracker/mobile": patch
---

Add Apollo Router integration tests covering JWKS validation, Rhai JWT-claim header mapping, and supergraph composition. New workspace `apps/integration-tests/router` runs the real `apollo-router` binary (v2.10.0, matching `apps/router/Dockerfile`) against a mock federated subgraph; reuses the production `apps/router/router.yaml` and `apps/router/rhai/main.rhai` verbatim.

The suite caught a real bug on its first run: the Rhai script was writing JWT claims to `request.headers` (the originating supergraph request, which is read-only in `subgraph_service` in Router v2.x). Assignments were silently ignored, so `x-user-id` and `x-user-role` never reached the subgraph. Fixed by switching to `request.subgraph.headers`.
