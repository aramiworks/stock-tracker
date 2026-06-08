import type { PrismaClient } from "@stock-tracker/prisma";
import type { Logger } from "@stock-tracker/config";
import type { Fetcher } from "../fetch/Fetcher.js";
import { parseHermesResponse } from "../brands/hermes/parse.js";

const BRAND = "Hermes" as const;

export interface PollDiscoveredHermesDeps {
  prisma: PrismaClient;
  fetcher: Fetcher;
  logger?: Logger;
  /** Injectable clock for deterministic tests. */
  now?: () => Date;
}

export interface PollDiscoveredHermesSummary {
  /** Rows attempted (non-stale Hermès discovered products). */
  checked: number;
  /** Rows resolved to in-stock this run. */
  inStock: number;
  /** Rows resolved to out-of-stock this run. */
  outStock: number;
  /** Rows that flipped out -> in this run. */
  transitions: number;
  /** Rows whose fetch/parse failed (in_stock left untouched). */
  errors: number;
}

/**
 * Resolve the live purchasable state of every non-stale Hermès
 * `discovered_products` row and persist it on the row (in_stock,
 * last_checked_at, last_changed_at). Turns "what's in stock now" into a DB
 * query instead of a live scrape.
 *
 * A pure availability snapshot — deliberately NOT wired to drop_events/alerts
 * (nothing can watch a discovered product; the app watches watchable_units/skus).
 * Reuses the INF-1602-hardened read path via the injected fetcher + the
 * status-gated `parseHermesResponse`. Never throws: a blocked/404/non-200 page
 * leaves in_stock untouched (never mislabeled out-of-stock) and bumps `errors`.
 */
export async function pollDiscoveredHermes(
  deps: PollDiscoveredHermesDeps,
): Promise<PollDiscoveredHermesSummary> {
  const { prisma, fetcher, logger } = deps;
  const now = deps.now ?? (() => new Date());

  const rows = await prisma.discovered_products.findMany({
    where: { brand: BRAND, is_stale: false },
    select: { id: true, url: true, in_stock: true },
  });

  const summary: PollDiscoveredHermesSummary = {
    checked: 0,
    inStock: 0,
    outStock: 0,
    transitions: 0,
    errors: 0,
  };

  for (const row of rows) {
    summary.checked++;
    try {
      const raw = await fetcher.get(row.url, {});
      const state = parseHermesResponse(raw);
      const next = state.inStock;
      const prior = row.in_stock ?? null;
      const changed = prior !== next;
      const transitioned = (prior === null || prior === false) && next;

      const at = now();
      await prisma.discovered_products.update({
        where: { id: row.id },
        data: {
          in_stock: next,
          last_checked_at: at,
          ...(changed ? { last_changed_at: at } : {}),
        },
      });

      if (next) summary.inStock++;
      else summary.outStock++;
      if (transitioned) summary.transitions++;
    } catch (err) {
      // Blocked / 404 / non-200 / parse failure — do NOT touch in_stock, so a
      // transient block never masquerades as a sold-out flip. Counted only.
      summary.errors++;
      logger?.warn(
        {
          event: "scraper.discovered_resolve_error",
          brand: BRAND,
          url: row.url,
          err: err instanceof Error ? err.message : String(err),
        },
        "poll-discovered-hermes resolve failed",
      );
    }
  }

  logger?.info(
    { event: "scraper.discovered_summary", brand: BRAND, ...summary },
    "poll-discovered-hermes summary",
  );
  return summary;
}
