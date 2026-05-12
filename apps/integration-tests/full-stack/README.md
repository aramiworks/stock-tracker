# @stock-tracker/integration-tests-full-stack

Post-deploy full-stack e2e tests for the **deployed develop** environment. Hits the
real Apollo Router → Subgraph → tRPC services → Prisma → Postgres chain with a real
Supabase JWT and verifies that the system composes and routes correctly.

## When this runs

Triggered by `.github/workflows/e2e.yml` after all four deploy workflows succeed
(`Backend Docker`, `Deploy Web`, `Schema Publish`, `EAS Update (OTA)`). It is
**not** a PR-time gate — PR-time coverage stays hermetic via `e2e-subgraph.yml`
and `router-e2e.yml`.

## What this catches that hermetic tests don't

| Concern                                             | Hermetic PR tests | This suite |
| --------------------------------------------------- | ----------------- | ---------- |
| Subgraph resolver logic                             | yes               | yes        |
| Router config / Rhai / JWKS                         | yes (mocked JWKS) | yes (real) |
| Supergraph composition against deployed subgraphs   | no                | yes        |
| Real JWKS URL + Supabase JWT signing keys           | no                | yes        |
| Railway env var typos / missing secrets             | no                | yes        |
| Network policy between router ↔ subgraph ↔ services | no                | yes        |
| Prisma migrations applied on the deployed DB        | no                | yes        |

## Test cases

| #   | Name                                                     | What it proves                                      |
| --- | -------------------------------------------------------- | --------------------------------------------------- |
| 1   | `me` query returns the authenticated user                | JWKS validation + auth subgraph + tRPC auth-service |
| 2   | `dashboard` query returns aggregates                     | Tracker subgraph + tRPC tracker-service + Prisma    |
| 3   | Unauthenticated request is rejected                      | Router enforces JWT before reaching subgraphs       |
| 4   | `createAccount` mutation round-trips                     | Mutation path through full chain + DB write         |
| 5   | Created account is owned by the JWT subject and readable | `x-user-id` propagation + RLS / ownership scoping   |
| 6   | Invalid query returns errors with extensions             | Error envelope preserved through router             |

## Required env

All injected by `e2e.yml` from repo secrets:

- `E2E_GRAPHQL_URL` — deployed Apollo Router URL
- `E2E_SUPABASE_URL`
- `E2E_SUPABASE_ANON_KEY`
- `E2E_SUPABASE_SERVICE_ROLE_KEY` — used for setup verification + cleanup
- `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` — persistent e2e fixture user

## Test data hygiene

Every account this suite creates is prefixed with `[e2e-${runId}]` where
`runId` is a timestamp+random string generated per run. `afterAll` deletes
all rows with that prefix (cascading to purchases via FK), so a crashed run
only leaks rows from its own run — and even those will be cleaned up by the
next successful run if you reuse the prefix scheme.

## Running locally

You need credentials for the deployed develop env:

```bash
op run -- npm run test:e2e -w apps/integration-tests/full-stack
```

Or set the env vars directly. The persistent E2E user must already exist in
the deployed Supabase project — bootstrap via `scripts/e2e-seed.mjs` if it
doesn't.

## Why a separate workspace from `integration-tests/router`

- **Router workspace** is hermetic — boots its own router + mock subgraph +
  test JWKS. Runs at PR time.
- **Full-stack workspace** is post-deploy — points at deployed URLs. Runs
  after deploys land.

Different infra, different cadence, different failure modes.
