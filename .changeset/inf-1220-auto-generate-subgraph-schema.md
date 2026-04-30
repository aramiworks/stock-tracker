---
"@stock-tracker/subgraph-tracker": patch
---

Auto-generate `apps/subgraphs/tracker/schema.graphql` from in-source typedefs via a new `scripts/print-schema.ts` (uses `printSubgraphSchema` from `@apollo/subgraph`). Wired into the subgraph `build` script so the artifact is regenerated on every CI build before `schema-publish.yml` runs `rover subgraph publish`. Adds a CI drift gate (`git diff --exit-code` on `schema.graphql` after rebuild) to fail PRs that change typedefs without updating the artifact. Regenerates `schema.graphql` to include all 6 tracker mutations + auth `upsertUser` mutation + extended Query fields that had been missing — these were defined in source but absent from the published supergraph, blocking mobile writes on develop/stage/master.
