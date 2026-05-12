/**
 * Generates apps/subgraphs/tracker/schema.graphql from the in-source typeDefs.
 *
 * The artifact is published to the Apollo registry by .github/workflows/schema-publish.yml,
 * which is what Apollo Router uses to compose the supergraph. Hand-maintaining it caused
 * the schema to drift (mutations were added in source but never reflected in the artifact),
 * leaving the deployed router unable to route mutations.
 *
 * Run via `npm run print-schema -w @stock-tracker/subgraph-tracker` or as part of the
 * subgraph build. CI drift gate compares the regenerated artifact against the committed copy.
 *
 * Usage: tsx scripts/print-schema.ts
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { buildSubgraphSchema, printSubgraphSchema } from "@apollo/subgraph";
import { trackerTypeDefs } from "../src/tracker/views/tracker.views.js";

const schema = buildSubgraphSchema([{ typeDefs: trackerTypeDefs }]);

const sdl = printSubgraphSchema(schema);

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, "../schema.graphql");
writeFileSync(outPath, sdl.endsWith("\n") ? sdl : sdl + "\n");

console.log(`Wrote ${outPath} (${sdl.length} bytes)`);
