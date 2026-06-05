import { schedules, task } from "@trigger.dev/sdk";
import { PrismaClient } from "@stock-tracker/prisma";
import { HttpFetcher } from "./fetch/HttpFetcher.js";
import { HermesFetcher } from "./fetch/HermesFetcher.js";
import { CapSolverDatadomeFetcher } from "./fetch/CapSolverDatadomeFetcher.js";
import { getProxyFromEnv } from "./fetch/proxy.js";
import { PrismaStateBuffer } from "./state/StateBuffer.js";
import { pollCartier } from "./poll/pollCartier.js";
import { pollHermes } from "./poll/pollHermes.js";
import { discoverHermes } from "./discover/discoverHermes.js";
import { createIngestClient } from "./ingest/trpcClient.js";
import {
  getScraperLogger,
  pageOnConsecutiveFailures,
} from "./observability/index.js";

// Smoke-test task from scaffold — keep until real tasks land
export const helloScraper = task({
  id: "hello-scraper",
  run: async () => {
    console.log("scraper online");
    return { status: "ok" };
  },
});

// Build the ingest client only when its env is configured. Without it,
// pollCartier still records transitions and logs — it just doesn't emit drop
// events (e.g. local runs without a service token).
function ingestFromEnv() {
  if (
    process.env.TRACKER_INGEST_URL &&
    process.env.TRACKER_INGEST_SERVICE_TOKEN
  ) {
    return createIngestClient();
  }
  return undefined;
}

// Build the paid DataDome solver only when its key is configured. Without it,
// HermesFetcher stays on the free fresh-IP-rotation path; with it, a persistent
// interstitial escalates to an inline CapSolver solve (INF-1602).
function capsolverFromEnv() {
  if (process.env["CAPSOLVER_API_KEY"]) {
    return new CapSolverDatadomeFetcher(process.env["CAPSOLVER_API_KEY"]);
  }
  return undefined;
}

/**
 * Poll every active Cartier SKU for stock and record state transitions.
 *
 * Cartier KR is fingerprint-level Akamai, so HttpFetcher fetches it with no
 * proxy. On an out->in transition the drop event is pushed to tracker-service
 * via the ingest client (INF-1573) when TRACKER_INGEST_URL +
 * TRACKER_INGEST_SERVICE_TOKEN are set; otherwise the transition is recorded
 * and logged only.
 */
export const pollCartierTask = schedules.task({
  id: "poll-cartier",
  cron: "*/5 * * * *", // placeholder cadence; product owns the final interval
  run: async () => {
    const prisma = new PrismaClient();
    const logger = getScraperLogger();
    try {
      const results = await pollCartier({
        prisma,
        fetcher: new HttpFetcher(),
        stateBuffer: new PrismaStateBuffer(prisma),
        logger,
        ingest: ingestFromEnv(),
      });

      const summary = {
        polled: results.length,
        inStock: results.filter((r) => r.inStock === true).length,
        transitions: results.filter((r) => r.transitioned).length,
        errors: results.filter((r) => r.error).length,
      };
      logger.info(
        { event: "scraper.poll_summary", brand: "Cartier", ...summary },
        "poll-cartier summary",
      );

      const page = await pageOnConsecutiveFailures(
        {
          prisma,
          logger,
          ...(process.env["SLACK_PAGER_WEBHOOK_URL"]
            ? { webhookUrl: process.env["SLACK_PAGER_WEBHOOK_URL"] }
            : {}),
          ...(process.env["SLACK_PAGE_FAILURE_THRESHOLD"]
            ? {
                threshold: Number(process.env["SLACK_PAGE_FAILURE_THRESHOLD"]),
              }
            : {}),
        },
        "Cartier",
      );

      return { ...summary, paged: page.paged.length };
    } finally {
      await prisma.$disconnect();
    }
  },
});

/**
 * Poll every active Hermès SKU for stock and record state transitions.
 *
 * Hermès KR sits behind DataDome (IP/time-bound blocks). HermesFetcher rotates
 * fresh Oxylabs KR sticky exit IPs — which clears blocks for free (INF-1507) —
 * and escalates a persistent interstitial to the paid CapSolver solve. That
 * escalation is env-gated: it turns on when CAPSOLVER_API_KEY is set
 * (capsolverFromEnv), and stays off (free path only) otherwise. The solve needs
 * HTTP/1.1 to read the challenge body — see the http2:false pins in
 * CapSolverDatadomeFetcher / oxylabsSticky (INF-1602). Drop-event ingest is NOT
 * wired yet (tRPC client stubbed, INF-1356); transitions are recorded and logged.
 */
export const pollHermesTask = schedules.task({
  id: "poll-hermes",
  cron: "*/5 * * * *", // placeholder cadence; product owns the final interval
  run: async () => {
    const prisma = new PrismaClient();
    const logger = getScraperLogger();
    try {
      const capsolver = capsolverFromEnv();
      const results = await pollHermes({
        prisma,
        fetcher: new HermesFetcher({
          proxy: getProxyFromEnv(),
          ...(capsolver ? { capsolver } : {}),
        }),
        stateBuffer: new PrismaStateBuffer(prisma),
        logger,
      });
      const summary = {
        polled: results.length,
        inStock: results.filter((r) => r.inStock === true).length,
        transitions: results.filter((r) => r.transitioned).length,
        errors: results.filter((r) => r.error).length,
      };
      logger.info(
        { event: "scraper.poll_summary", brand: "Hermes", ...summary },
        "poll-hermes summary",
      );

      const page = await pageOnConsecutiveFailures(
        {
          prisma,
          logger,
          ...(process.env["SLACK_PAGER_WEBHOOK_URL"]
            ? { webhookUrl: process.env["SLACK_PAGER_WEBHOOK_URL"] }
            : {}),
          ...(process.env["SLACK_PAGE_FAILURE_THRESHOLD"]
            ? {
                threshold: Number(process.env["SLACK_PAGE_FAILURE_THRESHOLD"]),
              }
            : {}),
        },
        "Hermes",
      );

      return { ...summary, paged: page.paged.length };
    } finally {
      await prisma.$disconnect();
    }
  },
});

/**
 * Daily catalog-freshness sweep for Hermès. Crawls the women's-bags category,
 * extracts each live product's article code + URL, and upserts one
 * `discovered_products` row per code (advancing last_seen_at); rows not seen
 * within the 14-day TTL are flipped is_stale. A freshness substrate only — it
 * never touches the curated watchable_units/skus. Reuses the INF-1602-hardened
 * HermesFetcher (http2:false + env-gated CapSolver), same as poll-hermes.
 */
export const discoverHermesTask = schedules.task({
  id: "discover-hermes-urls",
  cron: "0 18 * * *", // ~03:00 KST daily; product owns the final cadence
  run: async () => {
    const prisma = new PrismaClient();
    const logger = getScraperLogger();
    try {
      const capsolver = capsolverFromEnv();
      return await discoverHermes({
        prisma,
        fetcher: new HermesFetcher({
          proxy: getProxyFromEnv(),
          ...(capsolver ? { capsolver } : {}),
        }),
        logger,
      });
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
export * from "./fetch/oxylabsSticky.js";
export * from "./fetch/HermesFetcher.js";
export * from "./state/StateBuffer.js";
export * from "./ingest/trpcClient.js";
export * from "./observability/index.js";
export * from "./poll/pollCartier.js";
// pollHermes shares structural type names (IngestClient, PollSkuDeps,
// PollSkuResult) with pollCartier — re-export only its distinct surface to
// avoid ambiguous star-export collisions.
export {
  pollHermes,
  pollHermesSku,
  type PollHermesDeps,
} from "./poll/pollHermes.js";
export * from "./discover/discoverHermes.js";

// Spike: fetcher bake test (INF-1360)
export { bakeTestFetchers } from "./spikes/fetcher-bake-test/index.js";
