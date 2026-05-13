import { task } from "@trigger.dev/sdk";
import { PrismaClient } from "@stock-tracker/prisma";
import { HttpFetcher } from "../../fetch/HttpFetcher.js";
import { BrowserFetcher } from "../../fetch/BrowserFetcher.js";
import { getProxyFromEnv } from "../../fetch/proxy.js";
import { BAKE_TEST_URLS } from "./urls.js";
import { buildBakeResult, recordResult } from "./recorder.js";

/**
 * Bake-test task: runs both fetchers against the curated URL list and records results.
 *
 * Can be invoked ad-hoc with a custom runId, or scheduled every minute for a long bake.
 * Each invocation fetches all URLs with both fetchers in parallel.
 */
export const bakeTestFetchers = task({
  id: "bake-test-fetchers",
  run: async (payload: { runId?: string }) => {
    const runId =
      payload.runId ??
      `bake-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16)}`;

    const prisma = new PrismaClient();
    const proxy = getProxyFromEnv();
    const httpFetcher = new HttpFetcher();
    const browserFetcher = new BrowserFetcher();

    const fetchers = [
      { name: "http" as const, impl: httpFetcher },
      { name: "browser" as const, impl: browserFetcher },
    ];

    const results: Array<{ fetcher: string; url: string; success: boolean }> =
      [];

    for (const url of BAKE_TEST_URLS) {
      // Run both fetchers in parallel for each URL
      const promises = fetchers.map(async ({ name, impl }) => {
        const start = Date.now();
        try {
          const response = await impl.get(url, { proxy });
          const latencyMs = Date.now() - start;
          const result = buildBakeResult({
            fetcher: name,
            url,
            runId,
            response,
            latencyMs,
          });
          await recordResult(prisma, result);
          results.push({ fetcher: name, url, success: result.success });
          console.log(
            `[${name}] ${url} → ${response.status} (${latencyMs}ms) ${result.blocked ? "BLOCKED" : "OK"}`,
          );
        } catch (error) {
          const latencyMs = Date.now() - start;
          const result = buildBakeResult({
            fetcher: name,
            url,
            runId,
            latencyMs,
            error: error instanceof Error ? error : new Error(String(error)),
          });
          await recordResult(prisma, result);
          results.push({ fetcher: name, url, success: false });
          console.error(
            `[${name}] ${url} → ERROR (${latencyMs}ms): ${result.errorMsg}`,
          );
        }
      });

      await Promise.all(promises);
    }

    await prisma.$disconnect();

    const httpSuccess = results.filter(
      (r) => r.fetcher === "http" && r.success,
    ).length;
    const browserSuccess = results.filter(
      (r) => r.fetcher === "browser" && r.success,
    ).length;
    const urlCount = BAKE_TEST_URLS.length;

    console.log(
      `\nRun ${runId} complete: http ${httpSuccess}/${urlCount}, browser ${browserSuccess}/${urlCount}`,
    );

    return { runId, httpSuccess, browserSuccess, urlCount };
  },
});
