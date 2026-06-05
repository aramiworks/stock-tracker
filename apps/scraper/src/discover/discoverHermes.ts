import type { PrismaClient } from "@stock-tracker/prisma";
import type { Logger } from "@stock-tracker/config";
import type { Fetcher } from "../fetch/Fetcher.js";
import { isDataDomeInterstitial } from "../fetch/datadome.js";

const BRAND = "Hermes" as const;

/** A row not seen in a sweep for this long is flipped is_stale. */
const STALE_TTL_MS = 14 * 24 * 60 * 60_000;

/**
 * Women's-bags category pages to sweep. Scoped to bags only (no men's, no
 * shoes) per product. Add more category URLs here as coverage grows — the loop
 * already paces and dedupes across them.
 */
export const HERMES_DISCOVERY_CATEGORIES = [
  "https://www.hermes.com/kr/ko/category/women/bags-and-small-leather-goods/bags-and-clutches/",
];

/** Live Hermès article code: e.g. H086915CK37 (letter + 6 digits + tail). */
const ARTICLE_CODE_RE = /^[A-Z]\d{6}[A-Z0-9]+$/i;
/** Product paths in category HTML: /kr/ko/product/<korean-slug>-H……/ */
const PRODUCT_PATH_RE = /\/kr\/ko\/product\/[^"'\s<>]+\//gi;

export interface DiscoverHermesDeps {
  prisma: PrismaClient;
  fetcher: Fetcher;
  logger?: Logger;
  /** Injectable clock for deterministic tests. */
  now?: () => Date;
}

export interface DiscoverHermesSummary {
  /** Category pages that returned a clean, parseable 200. */
  swept: number;
  /** Distinct valid article codes seen across all swept pages. */
  discovered: number;
  /** Rows created for the first time this run. */
  created: number;
  /** Rows that existed but were is_stale=true and are now live again. */
  restocked: number;
  /** Rows flipped is_stale=true this run (not seen within the TTL). */
  stale: number;
}

interface DiscoveredItem {
  articleCode: string;
  url: string;
  modelHint: string | null;
}

/**
 * Parse the product paths out of a category page's HTML into discovered items.
 * Exported for unit testing the extraction in isolation.
 */
export function extractDiscoveredItems(html: string): DiscoveredItem[] {
  const byCode = new Map<string, DiscoveredItem>();
  for (const m of html.matchAll(PRODUCT_PATH_RE)) {
    const path = m[0];
    // The product segment is the token between /product/ and the trailing slash.
    const segment = path.slice("/kr/ko/product/".length, -1);
    const lastHyphen = segment.lastIndexOf("-");
    if (lastHyphen < 0) continue;
    const articleCode = segment.slice(lastHyphen + 1);
    if (!ARTICLE_CODE_RE.test(articleCode)) continue; // not a real code — skip
    const modelHint = segment.slice(0, lastHyphen) || null;
    // First occurrence wins; later category cards are duplicates.
    if (!byCode.has(articleCode)) {
      byCode.set(articleCode, {
        articleCode,
        url: `https://www.hermes.com${path}`,
        modelHint,
      });
    }
  }
  return [...byCode.values()];
}

/**
 * Daily catalog-freshness sweep. Fetches the Hermès women's-bags category
 * pages, extracts each live product's article code + URL, and upserts one
 * `discovered_products` row per code (advancing last_seen_at). Rows not seen
 * within the stale TTL are flipped is_stale.
 *
 * A freshness substrate only — never touches watchable_units/skus. Reuses the
 * INF-1602-hardened HermesFetcher (http2:false + env-gated CapSolver) via the
 * injected fetcher.
 */
export async function discoverHermes(
  deps: DiscoverHermesDeps,
): Promise<DiscoverHermesSummary> {
  const { prisma, fetcher, logger } = deps;
  const now = deps.now ?? (() => new Date());

  const items = new Map<string, DiscoveredItem>();
  let swept = 0;

  for (const url of HERMES_DISCOVERY_CATEGORIES) {
    let raw;
    try {
      raw = await fetcher.get(url, {});
    } catch (err) {
      logger?.warn(
        {
          event: "scraper.discovery_fetch_error",
          brand: BRAND,
          url,
          err: err instanceof Error ? err.message : String(err),
        },
        "discover-hermes category fetch threw",
      );
      continue;
    }

    if (raw.status !== 200 || isDataDomeInterstitial(raw.body)) {
      // Blocked or non-200 — don't write partial garbage from this page.
      logger?.warn(
        {
          event: "scraper.discovery_blocked",
          brand: BRAND,
          url,
          status: raw.status,
        },
        "discover-hermes category not parseable; skipped",
      );
      continue;
    }

    swept++;
    for (const item of extractDiscoveredItems(raw.body)) {
      if (!items.has(item.articleCode)) items.set(item.articleCode, item);
    }
  }

  const at = now();
  let created = 0;
  let restocked = 0;

  for (const item of items.values()) {
    const existing = await prisma.discovered_products.findUnique({
      where: {
        brand_article_code: { brand: BRAND, article_code: item.articleCode },
      },
      select: { is_stale: true },
    });
    if (existing?.is_stale) restocked++;
    if (!existing) created++;

    await prisma.discovered_products.upsert({
      where: {
        brand_article_code: { brand: BRAND, article_code: item.articleCode },
      },
      create: {
        brand: BRAND,
        article_code: item.articleCode,
        url: item.url,
        model_hint: item.modelHint,
        first_seen_at: at,
        last_seen_at: at,
        is_stale: false,
      },
      update: {
        url: item.url,
        model_hint: item.modelHint,
        last_seen_at: at,
        is_stale: false,
      },
    });
  }

  // Flip rows not seen within the TTL to stale. Only runs after a successful
  // sweep (swept > 0) so a fully-blocked run never mass-marks everything stale.
  let stale = 0;
  if (swept > 0) {
    const cutoff = new Date(at.getTime() - STALE_TTL_MS);
    const res = await prisma.discovered_products.updateMany({
      where: { brand: BRAND, is_stale: false, last_seen_at: { lt: cutoff } },
      data: { is_stale: true },
    });
    stale = res.count;
  }

  const summary: DiscoverHermesSummary = {
    swept,
    discovered: items.size,
    created,
    restocked,
    stale,
  };
  logger?.info(
    { event: "scraper.discovery_summary", brand: BRAND, ...summary },
    "discover-hermes summary",
  );
  return summary;
}
