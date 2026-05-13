/**
 * CLI script to analyze bake-test results.
 *
 * Usage: npx tsx scripts/analyze-bake.ts --runId=smoke-2026-05-12
 */
import { PrismaClient } from "@stock-tracker/prisma";
import {
  analyzeBake,
  formatAnalysis,
} from "../src/spikes/fetcher-bake-test/analyze.js";

const args = process.argv.slice(2);
const runIdArg = args.find((a) => a.startsWith("--runId="));

if (!runIdArg) {
  console.error("Usage: npx tsx scripts/analyze-bake.ts --runId=<run-id>");
  console.error("\nAvailable run IDs:");

  const prisma = new PrismaClient();
  const runs = await prisma.fetcher_bake_results.groupBy({
    by: ["run_id"],
    _count: true,
    orderBy: { run_id: "desc" },
    take: 20,
  });
  for (const run of runs) {
    console.error(`  ${run.run_id} (${run._count} rows)`);
  }
  await prisma.$disconnect();
  process.exit(1);
}

const runId = runIdArg.split("=")[1]!;
const prisma = new PrismaClient();

const analysis = await analyzeBake(prisma, runId);
console.log(formatAnalysis(analysis));

await prisma.$disconnect();
