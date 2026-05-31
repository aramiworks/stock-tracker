/**
 * WSA-only smoke runner for INF-1492.
 *
 * Runs OxylabsScraperApiFetcher against the same 10 Hermès KR URLs used in
 * the INF-1413 bake test and persists results to fetcher_bake_results with
 * fetcher = "oxylabs_wsa".
 *
 * Usage:
 *   DOPPLER_PROJECT=stock-tracker DOPPLER_CONFIG=develop doppler run -- \
 *     npx tsx apps/scraper/scripts/run-smoke-wsa.ts --runId=wsa-smoke-2026-05-21
 *
 * Cost estimate: 10 URLs × 10 rounds = 100 WSA requests ≈ $0.22
 */
import { PrismaClient } from "@prisma/client";
import { OxylabsScraperApiFetcher } from "../src/fetch/OxylabsScraperApiFetcher.js";
import { BAKE_TEST_URLS } from "../src/spikes/fetcher-bake-test/urls.js";
import { isAkamaiBlocked } from "../src/fetch/HttpFetcher.js";
import type { RawResponse } from "../src/brands/BrandAdapter.js";

// WSA handles its own proxying — pass a dummy proxy to satisfy the interface
const DUMMY_PROXY = {
  host: "unused",
  port: 0,
  username: "unused",
  password: "unused",
  countryCode: "KR",
} as const;

const AKAMAI_STATUS_CODES = new Set([403, 429, 503]);
const INTERVAL_MS = 60_000;
const ROUNDS = 10;
// WSA $2.2 / 1000 results
const WSA_COST_PER_REQUEST = 0.0022;

const args = process.argv.slice(2);
const runIdArg = args.find((a) => a.startsWith("--runId="));
const runId = runIdArg
  ? runIdArg.split("=")[1]!
  : `wsa-smoke-${new Date().toISOString().slice(0, 10)}`;

console.log(`Starting WSA smoke test: runId=${runId}`);
console.log(
  `URLs: ${BAKE_TEST_URLS.length}, rounds: ${ROUNDS}, interval: ${INTERVAL_MS / 1000}s`,
);
console.log(
  `Est. cost: ~$${(BAKE_TEST_URLS.length * ROUNDS * WSA_COST_PER_REQUEST).toFixed(2)} (${BAKE_TEST_URLS.length * ROUNDS} requests)`,
);
console.log("");

const prisma = new PrismaClient();
const fetcher = new OxylabsScraperApiFetcher();

function buildResult(
  url: string,
  response: RawResponse | undefined,
  latencyMs: number,
  error?: Error,
) {
  if (error) {
    return {
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

for (let round = 1; round <= ROUNDS; round++) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`\n=== Round ${round}/${ROUNDS} (${elapsed}s elapsed) ===`);

  for (const url of BAKE_TEST_URLS) {
    const start = Date.now();
    try {
      const response = await fetcher.get(url, { proxy: DUMMY_PROXY });
      const latencyMs = Date.now() - start;
      const result = buildResult(url, response, latencyMs);
      await prisma.fetcher_bake_results.create({
        data: {
          fetcher: "oxylabs_wsa",
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
      const tag = result.blocked ? "BLOCKED" : result.success ? "OK" : "FAIL";
      console.log(
        `  [wsa] ${shortUrl} → ${response.status} (${latencyMs}ms) ${tag}`,
      );
    } catch (error) {
      const latencyMs = Date.now() - start;
      const err = error instanceof Error ? error : new Error(String(error));
      const result = buildResult(url, undefined, latencyMs, err);
      await prisma.fetcher_bake_results.create({
        data: {
          fetcher: "oxylabs_wsa",
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
        `  [wsa] ${shortUrl} → ERROR (${latencyMs}ms): ${err.message.slice(0, 100)}`,
      );
    }
  }

  if (round < ROUNDS) {
    console.log(`\nWaiting ${INTERVAL_MS / 1000}s until next round...`);
    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  }
}

// Analysis
console.log("\n\n========================================");
console.log("WSA SMOKE TEST COMPLETE");
console.log("========================================");

const rows = await prisma.fetcher_bake_results.findMany({
  where: { run_id: runId, fetcher: "oxylabs_wsa" },
  orderBy: { created_at: "asc" },
});

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)]!;
}

const total = rows.length;
const successCount = rows.filter((r) => r.success).length;
const blockedCount = rows.filter((r) => r.blocked).length;
const errorCount = rows.filter((r) => !r.success && !r.blocked).length;
const latencies = rows.map((r) => r.latency_ms).sort((a, b) => a - b);
const totalBytes = rows.reduce((sum, r) => sum + r.content_length, 0);
const estimatedCost = total * WSA_COST_PER_REQUEST;

// Per-URL breakdown
const byUrl = new Map<string, (typeof rows)[number][]>();
for (const row of rows) {
  const existing = byUrl.get(row.url) ?? [];
  existing.push(row);
  byUrl.set(row.url, existing);
}

console.log(`\nTotal requests: ${total}\n`);
console.log("--- Per-URL success rates ---");
for (const [url, urlRows] of byUrl) {
  const urlSuccess = urlRows.filter((r) => r.success).length;
  const shortUrl = url.replace("https://www.hermes.com/kr/ko/", "");
  console.log(
    `  ${shortUrl}: ${urlSuccess}/${urlRows.length} (${((urlSuccess / urlRows.length) * 100).toFixed(0)}%)`,
  );
}

console.log("\n--- Oxylabs WSA Fetcher Summary ---");
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
console.log(`  Est. cost:    $${estimatedCost.toFixed(4)}`);

const productPageRows = rows.filter(
  (r) => !r.url.endsWith("/kr/ko/") && !r.url.endsWith("/kr/ko"),
);
const productSuccess = productPageRows.filter((r) => r.success).length;
console.log(
  `\n  Product-page success: ${productSuccess}/${productPageRows.length} (${productPageRows.length > 0 ? ((productSuccess / productPageRows.length) * 100).toFixed(1) : "N/A"}%)`,
);

const verdict =
  productPageRows.length > 0 && productSuccess / productPageRows.length >= 0.95;
console.log(
  `\n  VERDICT: ${verdict ? "PASS ✓ WSA achieves ≥95% on product pages" : "FAIL ✗ WSA did NOT reach ≥95% on product pages"}`,
);

await prisma.$disconnect();
