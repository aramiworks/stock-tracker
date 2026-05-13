import { PrismaClient } from "@stock-tracker/prisma";

export interface FetcherStats {
  fetcher: string;
  totalRequests: number;
  successCount: number;
  successRate: number;
  blockedCount: number;
  blockRate: number;
  errorCount: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  totalBytes: number;
  estimatedCostUsd: number;
}

export interface BakeAnalysis {
  runId: string;
  totalRequests: number;
  fetchers: FetcherStats[];
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)]!;
}

const OXYLABS_COST_PER_GB = 15; // $15/GB for residential PAYG

export async function analyzeBake(
  prisma: PrismaClient,
  runId: string,
): Promise<BakeAnalysis> {
  const rows = await prisma.fetcher_bake_results.findMany({
    where: { run_id: runId },
    orderBy: { created_at: "asc" },
  });

  const byFetcher = new Map<string, (typeof rows)[number][]>();
  for (const row of rows) {
    const existing = byFetcher.get(row.fetcher) ?? [];
    existing.push(row);
    byFetcher.set(row.fetcher, existing);
  }

  const fetchers: FetcherStats[] = [];

  for (const [fetcher, fetcherRows] of byFetcher) {
    const totalRequests = fetcherRows.length;
    const successCount = fetcherRows.filter((r) => r.success).length;
    const blockedCount = fetcherRows.filter((r) => r.blocked).length;
    const errorCount = fetcherRows.filter(
      (r) => !r.success && !r.blocked,
    ).length;

    const latencies = fetcherRows
      .map((r) => r.latency_ms)
      .sort((a, b) => a - b);
    const totalBytes = fetcherRows.reduce(
      (sum, r) => sum + r.content_length,
      0,
    );

    fetchers.push({
      fetcher,
      totalRequests,
      successCount,
      successRate: totalRequests > 0 ? (successCount / totalRequests) * 100 : 0,
      blockedCount,
      blockRate: totalRequests > 0 ? (blockedCount / totalRequests) * 100 : 0,
      errorCount,
      p50LatencyMs: percentile(latencies, 50),
      p95LatencyMs: percentile(latencies, 95),
      totalBytes,
      estimatedCostUsd: (totalBytes / 1_073_741_824) * OXYLABS_COST_PER_GB,
    });
  }

  return {
    runId,
    totalRequests: rows.length,
    fetchers,
  };
}

export function formatAnalysis(analysis: BakeAnalysis): string {
  const lines: string[] = [
    `\n=== Bake Test Analysis: ${analysis.runId} ===`,
    `Total requests: ${analysis.totalRequests}`,
    "",
  ];

  for (const f of analysis.fetchers) {
    lines.push(`--- ${f.fetcher.toUpperCase()} Fetcher ---`);
    lines.push(`  Requests:     ${f.totalRequests}`);
    lines.push(
      `  Success:      ${f.successCount} (${f.successRate.toFixed(1)}%)`,
    );
    lines.push(
      `  Blocked:      ${f.blockedCount} (${f.blockRate.toFixed(1)}%)`,
    );
    lines.push(`  Errors:       ${f.errorCount}`);
    lines.push(`  p50 latency:  ${f.p50LatencyMs}ms`);
    lines.push(`  p95 latency:  ${f.p95LatencyMs}ms`);
    lines.push(`  Total bytes:  ${(f.totalBytes / 1024).toFixed(1)}KB`);
    lines.push(`  Est. cost:    $${f.estimatedCostUsd.toFixed(4)}`);
    lines.push("");
  }

  return lines.join("\n");
}
