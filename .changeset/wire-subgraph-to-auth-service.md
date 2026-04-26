---
"@stock-tracker/subgraph-tracker": patch
"@stock-tracker/auth-service": patch
---

Wire the tracker subgraph's auth resolver to the new NestJS auth-service (port 4030, `/trpc`) via `TRPC_AUTH_SERVICE_URL`. Local-only cutover — apps/api remains in the tree and on Railway as the production auth backend until a follow-up issue migrates the deploy.
