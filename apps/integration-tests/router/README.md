# @stock-tracker/integration-tests-router

Integration tests for the Apollo Router that run the **real `apollo-router` binary** with the production `apps/router/router.yaml` and `apps/router/supergraph.yaml`, in front of a minimal mock subgraph.

## What's covered

| Concern | Test |
|---------|------|
| Unauthenticated requests pass through without `x-user-id` (auth deferred to subgraph) | `passes unauthenticated requests through without x-user-id` |
| JWKS validation rejects untrusted-key JWTs | `rejects JWTs signed by an untrusted key` |
| Rhai script maps JWT `sub` → `x-user-id` | `maps JWT 'sub' claim to x-user-id on the subgraph request` |
| Rhai script maps JWT `role` → `x-user-role` | `maps JWT 'role' claim to x-user-role on the subgraph request` |
| Rhai omits `x-user-role` when claim is absent | `omits x-user-role when JWT has no 'role' claim` |
| `x-request-id` propagation to subgraph | `propagates x-request-id from client to subgraph` |
| Supergraph composition + routing | `composes the supergraph and routes a query to the subgraph` |

These all exercise behavior in `apps/router/router.yaml`, `apps/router/rhai/main.rhai`, and `apps/router/supergraph.yaml` that has zero coverage in the existing `subgraph.e2e.test.ts` (which uses a bare `ApolloServer` and bypasses the router).

## Architecture

```
test (Jest)
  ├─ JWKS HTTP server         (RS256 keypair; SUPABASE_JWKS_URL points here)
  ├─ Mock federated subgraph  (random free port; records inbound headers)
  └─ apollo-router            (random free port; spawned with prod router.yaml + rhai script)
       └─ supergraph SDL composed via `rover supergraph compose` against the mock
       └─ uses a temp supergraph.yaml generated per-run (subgraph URL pinned to the
          dynamic mock port — this is the only deviation from prod config)
```

The router and subgraph both bind to free ports picked at startup so the suite is
robust to port :4011 being busy locally (e.g. `npm run dev:subgraph`) and supports
parallel test runs.

The router binary is pinned to **v2.10.0** to match `apps/router/Dockerfile`.

The mock subgraph implements two queries:

```graphql
type Query {
  testHeaders: TestHeaders!     # echoes inbound HTTP headers — used to assert what the router forwarded
  testEcho(input: String!): String!  # federation routing sanity check
}
```

This keeps the test surface narrow to **router behavior**. Subgraph/tRPC/Prisma logic is covered by `apps/subgraphs/tracker/src/__tests__/subgraph.e2e.test.ts`.

## Prerequisites

- Node 20+
- `apollo-router` binary on PATH (the same binary `npm run dev:router` uses)
- `rover` binary on PATH (used to compose the supergraph at test startup)

Install both via the official scripts:

```bash
curl -sSL https://router.apollo.dev/download/nix/latest | sh
curl -sSL https://rover.apollo.dev/nix/latest | sh
```

Then add `~/.rover/bin` to your PATH.

## Running

```bash
# From repo root
npm run test:e2e -w apps/integration-tests/router
```

Each test bring-up takes ~3-5 seconds (mock subgraph + rover compose + router cold start). All seven tests should pass in well under a minute.

## Prerequisites: GraphOS license

The router's `authentication.router.jwt` plugin is GraphOS-licensed and refuses to start without `APOLLO_KEY` + `APOLLO_GRAPH_REF`. Tests reuse the same credentials production does (see `infra/railway/src/config.ts`):

```bash
op run -- npm run test:e2e -w apps/integration-tests/router
```

In CI, `APOLLO_KEY` is a repo secret and `APOLLO_GRAPH_REF` is a repo variable.

## Verifying the suite catches regressions

To prove the tests are wired correctly, temporarily break `apps/router/rhai/main.rhai`:

```rhai
// comment out:
// request.subgraph.headers["x-user-id"] = sub.to_string();
```

Re-run the suite. The `maps JWT 'sub' claim to x-user-id` test must fail. Restore the line.

> Note: in subgraph_service, `request.headers` refers to the originating supergraph
> request and is **read-only** in v2.x — assignments are silently ignored. The outbound
> subgraph request lives at `request.subgraph.headers`. This bug is exactly what
> these tests caught on the first run.

## CI

`.github/workflows/router-e2e.yml` triggers on PRs that touch the router config, the mock subgraph, or this workspace. It installs `apollo-router` + `rover` and runs the same `npm run test:e2e` command.

## Adding new tests

To assert a new router behavior:

1. If you need a new piece of state from the subgraph, extend `helpers/mock-subgraph.ts` (the schema is intentionally minimal).
2. If you need new headers or claims, add them to `helpers/jwt.ts` `signTestJwt` options.
3. Add the test to `router.e2e.test.ts`.

Avoid adding real DB or real subgraph plumbing here — those concerns live in `apps/subgraphs/tracker/src/__tests__/`.
