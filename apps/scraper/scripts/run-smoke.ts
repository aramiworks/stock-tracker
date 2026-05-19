/**
 * Local smoke-test runner for the fetcher bake test.
 *
 * Self-contained script that avoids @stock-tracker/prisma workspace resolution
 * issues in worktrees by importing @prisma/client directly.
 *
 * Usage:
 *   DOPPLER_PROJECT=stock-tracker DOPPLER_CONFIG=develop doppler run -- \
 *     npx tsx apps/scraper/scripts/run-smoke.ts --runId=smoke-2026-05-13
 */
import { PrismaClient } from "@prisma/client";
import { HttpFetcher } from "../src/fetch/HttpFetcher.js";
import { BrowserFetcher } from "../src/fetch/BrowserFetcher.js";
import { getProxyFromEnv } from "../src/fetch/proxy.js";
import { BAKE_TEST_URLS } from "../src/spikes/fetcher-bake-test/urls.js";
import { isAkamaiBlocked } from "../src/fetch/HttpFetcher.js";
import type { RawResponse } from "../src/brands/BrandAdapter.js";

const AKAMAI_STATUS_CODES = new Set([403, 429, 503]);
const INTERVAL_MS = 60_000;
const DURATION_MS = 10 * 60_000;
const OXYLABS_COST_PER_GB = 15;

const args = process.argv.slice(2);
const runIdArg = args.find((a) => a.startsWith("--runId="));
const runId = runIdArg
  ? runIdArg.split("=")[1]!
  : `smoke-${new Date().toISOString().slice(0, 16).replace(/[:.]/g, "-")}`;

console.log(`Starting smoke test: runId=${runId}`);
console.log(
  `URLs: ${BAKE_TEST_URLS.length}, interval: ${INTERVAL_MS / 1000}s, duration: ${DURATION_MS / 60_000}min`,
);
console.log("");

const prisma = new PrismaClient();
const proxy = getProxyFromEnv();
const httpFetcher = new HttpFetcher();
const browserFetcher = new BrowserFetcher();

const fetchers = [
  { name: "http" as const, impl: httpFetcher },
  { name: "browser" as const, impl: browserFetcher },
];

function buildResult(
  fetcher: "http" | "browser",
  url: string,
  response: RawResponse | undefined,
  latencyMs: number,
  error?: Error,
) {
  if (error) {
    return {
      fetcher,
      url,
      status: 0,
      latencyMs,
      success: false,
      blocked: false,
      errorMsg: error.message.slice(0, 500),
      contentLength: 0,
    };
  }
  const resp = response!;
  const blocked =
    AKAMAI_STATUS_CODES.has(resp.status) || isAkamaiBlocked(resp.body);
  const success = resp.status >= 200 && resp.status < 400 && !blocked;
  return {
    fetcher,
    url,
    status: resp.status,
    latencyMs,
    success,
    blocked,
    errorMsg: blocked ? "Akamai challenge/block detected" : null,
    contentLength: Buffer.byteLength(resp.body, "utf-8"),
  };
}

const startTime = Date.now();
let round = 0;

async function runRound(): Promise<void> {
  round++;
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`\n=== Round ${round} (${elapsed}s elapsed) ===`);

  for (const url of BAKE_TEST_URLS) {
    const promises = fetchers.map(async ({ name, impl }) => {
      const start = Date.now();
      try {
        const response = await impl.get(url, { proxy });
        const latencyMs = Date.now() - start;
        const result = buildResult(name, url, response, latencyMs);
        await prisma.fetcher_bake_results.create({
          data: {
            fetcher: result.fetcher,
            url: result.url,
            status: result.status,
            latency_ms: result.latencyMs,
            success: result.success,
            blocked: result.blocked,
            error_msg: result.errorMsg,
            content_length: result.contentLength,
            run_id: runId,
          },
        });
        const shortUrl = url.replace("https://www.hermes.com/kr/ko/", "");
        console.log(
          `  [${name}] ${shortUrl} → ${response.status} (${latencyMs}ms) ${result.blocked ? "BLOCKED" : "OK"}`,
        );
      } catch (error) {
        const latencyMs = Date.now() - start;
        const err = error instanceof Error ? error : new Error(String(error));
        const result = buildResult(name, url, undefined, latencyMs, err);
        await prisma.fetcher_bake_results.create({
          data: {
            fetcher: result.fetcher,
            url: result.url,
            status: result.status,
            latency_ms: result.latencyMs,
            success: result.success,
            blocked: result.blocked,
            error_msg: result.errorMsg,
            content_length: result.contentLength,
            run_id: runId,
          },
        });
        const shortUrl = url.replace("https://www.hermes.com/kr/ko/", "");
        console.error(
          `  [${name}] ${shortUrl} → ERROR (${latencyMs}ms): ${err.message.slice(0, 100)}`,
        );
      }
    });

    await Promise.all(promises);
  }
}

// Main loop
while (Date.now() - startTime < DURATION_MS) {
  await runRound();

  const remaining = DURATION_MS - (Date.now() - startTime);
  if (remaining > INTERVAL_MS) {
    console.log(`\nWaiting ${INTERVAL_MS / 1000}s until next round...`);
    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  } else if (remaining > 0) {
    console.log(`\nLast round — ${(remaining / 1000).toFixed(0)}s remaining`);
  } else {
    break;
  }
}

// Analysis
console.log("\n\n========================================");
console.log("SMOKE TEST COMPLETE");
console.log("========================================");

const rows = await prisma.fetcher_bake_results.findMany({
  where: { run_id: runId },
  orderBy: { created_at: "asc" },
});

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)]!;
}

const byFetcher = new Map<string, (typeof rows)[number][]>();
for (const row of rows) {
  const existing = byFetcher.get(row.fetcher) ?? [];
  existing.push(row);
  byFetcher.set(row.fetcher, existing);
}

console.log(`\nTotal requests: ${rows.length}\n`);

for (const [fetcher, fetcherRows] of byFetcher) {
  const total = fetcherRows.length;
  const successCount = fetcherRows.filter((r) => r.success).length;
  const blockedCount = fetcherRows.filter((r) => r.blocked).length;
  const errorCount = fetcherRows.filter((r) => !r.success && !r.blocked).length;
  const latencies = fetcherRows.map((r) => r.latency_ms).sort((a, b) => a - b);
  const totalBytes = fetcherRows.reduce((sum, r) => sum + r.content_length, 0);
  const costUsd = (totalBytes / 1_073_741_824) * OXYLABS_COST_PER_GB;

  console.log(`--- ${fetcher.toUpperCase()} Fetcher ---`);
  console.log(`  Requests:     ${total}`);
  console.log(
    `  Success:      ${successCount} (${((successCount / total) * 100).toFixed(1)}%)`,
  );
  console.log(
    `  Blocked:      ${blockedCount} (${((blockedCount / total) * 100).toFixed(1)}%)`,
  );
  console.log(`  Errors:       ${errorCount}`);
  console.log(`  p50 latency:  ${percentile(latencies, 50)}ms`);
  console.log(`  p95 latency:  ${percentile(latencies, 95)}ms`);
  console.log(`  Total bytes:  ${(totalBytes / 1024).toFixed(1)}KB`);
  console.log(`  Est. cost:    $${costUsd.toFixed(4)}`);
  console.log("");
}

await prisma.$disconnect();
