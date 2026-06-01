import { schedules, task } from "@trigger.dev/sdk";
import { PrismaClient } from "@stock-tracker/prisma";
import { HttpFetcher } from "./fetch/HttpFetcher.js";
import { PrismaStateBuffer } from "./state/StateBuffer.js";
import { pollCartier } from "./poll/pollCartier.js";

// Smoke-test task from scaffold — keep until real tasks land
export const helloScraper = task({
  id: "hello-scraper",
  run: async () => {
    console.log("scraper online");
    return { status: "ok" };
  },
});

/**
 * Poll every active Cartier SKU for stock and record state transitions.
 *
 * Cartier KR is fingerprint-level Akamai, so HttpFetcher fetches it with no
 * proxy. Drop-event ingest is intentionally NOT wired yet — the tRPC client is
 * stubbed (INF-1356); transitions are recorded and logged until it lands, at
 * which point pass `ingest: createIngestClient()` into pollCartier here.
 */
export const pollCartierTask = schedules.task({
  id: "poll-cartier",
  cron: "*/5 * * * *", // placeholder cadence; product owns the final interval
  run: async () => {
    const prisma = new PrismaClient();
    try {
      const results = await pollCartier({
        prisma,
        fetcher: new HttpFetcher(),
        stateBuffer: new PrismaStateBuffer(prisma),
      });
      return {
        polled: results.length,
        inStock: results.filter((r) => r.inStock === true).length,
        transitions: results.filter((r) => r.transitioned).length,
        errors: results.filter((r) => r.error).length,
      };
    } finally {
      await prisma.$disconnect();
    }
  },
});

// Public API
export * from "./brands/BrandAdapter.js";
export * from "./brands/registry.js";
export * from "./fetch/Fetcher.js";
export * from "./fetch/HttpFetcher.js";
export * from "./fetch/BrowserFetcher.js";
export * from "./fetch/proxy.js";
export * from "./state/StateBuffer.js";
export * from "./ingest/trpcClient.js";
export * from "./poll/pollCartier.js";

// Spike: fetcher bake test (INF-1360)
export { bakeTestFetchers } from "./spikes/fetcher-bake-test/index.js";
