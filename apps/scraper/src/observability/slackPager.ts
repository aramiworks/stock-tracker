import type { PrismaClient } from "@stock-tracker/prisma";
import type { Logger } from "@stock-tracker/config";

const DEFAULT_THRESHOLD = 5;
const DEFAULT_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface SlackPagerDeps {
  prisma: PrismaClient;
  logger: Logger;
  /** Slack incoming-webhook URL. Page is a no-op when unset. */
  webhookUrl?: string;
  /** Number of consecutive failures required to page. Defaults to 5. */
  threshold?: number;
  /** Suppress further pages for this SKU during the window. Defaults to 6h. */
  cooldownMs?: number;
  /** Injectable fetch for tests. */
  fetch?: typeof globalThis.fetch;
  /** Injectable clock for deterministic tests. */
  now?: () => Date;
}

export interface SlackPageResult {
  /** SKU ids that were paged this run. */
  paged: string[];
  /** SKU ids that crossed the threshold but were inside the cooldown window. */
  suppressed: string[];
}

interface StalledSku {
  skuId: string;
  brand: string;
  referenceCode: string | null;
  consecutiveErrors: number;
  lastChecked: Date;
}

/**
 * Page Slack once per SKU that crosses the consecutive-error threshold,
 * deduped per SKU inside `cooldownMs`. Designed to be safe to call at the
 * tail of every poll run — it queries `sku_stock_state` for stalled SKUs,
 * posts to the configured webhook, then stamps `last_paged_at`.
 *
 * No-ops (with `paged: []`) when `webhookUrl` is unset so dev/test runs
 * don't surprise-page anyone.
 */
export async function pageOnConsecutiveFailures(
  deps: SlackPagerDeps,
  brand: "Hermes" | "Cartier",
): Promise<SlackPageResult> {
  const threshold = deps.threshold ?? DEFAULT_THRESHOLD;
  const cooldownMs = deps.cooldownMs ?? DEFAULT_COOLDOWN_MS;
  const now = deps.now ?? (() => new Date());
  const fetchImpl = deps.fetch ?? globalThis.fetch;

  if (!deps.webhookUrl) {
    return { paged: [], suppressed: [] };
  }

  const cooldownCutoff = new Date(now().getTime() - cooldownMs);

  const stalled = await loadStalledSkus(deps.prisma, brand, threshold);

  const paged: string[] = [];
  const suppressed: string[] = [];

  for (const sku of stalled) {
    if (sku.lastPagedAt && sku.lastPagedAt > cooldownCutoff) {
      suppressed.push(sku.skuId);
      continue;
    }

    const posted = await postSlackMessage(fetchImpl, deps.webhookUrl, {
      brand,
      sku,
      threshold,
    });
    if (!posted) {
      deps.logger.error(
        {
          event: "scraper.slack_page_failed",
          brand,
          skuId: sku.skuId,
        },
        `slack page failed: ${brand} ${sku.skuId}`,
      );
      continue;
    }

    await deps.prisma.sku_stock_state.update({
      where: { sku_id: sku.skuId },
      data: { last_paged_at: now() },
    });

    deps.logger.warn(
      {
        event: "scraper.slack_paged",
        brand,
        skuId: sku.skuId,
        consecutiveErrors: sku.consecutiveErrors,
      },
      `slack page: ${brand} ${sku.skuId} (${sku.consecutiveErrors} consecutive errors)`,
    );

    paged.push(sku.skuId);
  }

  return { paged, suppressed };
}

interface StalledQueryRow extends StalledSku {
  lastPagedAt: Date | null;
}

async function loadStalledSkus(
  prisma: PrismaClient,
  brand: "Hermes" | "Cartier",
  threshold: number,
): Promise<StalledQueryRow[]> {
  // We deliberately pull all stalled SKUs (regardless of last_paged_at) and
  // filter in JS — that keeps the query simple and lets the caller see
  // suppressed SKUs without a second round trip.
  const rows = await prisma.sku_stock_state.findMany({
    where: {
      consecutive_errors: { gte: threshold },
      sku: { watchable_unit: { brand } },
    },
    select: {
      sku_id: true,
      consecutive_errors: true,
      last_checked: true,
      last_paged_at: true,
      sku: {
        select: {
          reference_code: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    skuId: row.sku_id,
    brand,
    referenceCode: row.sku.reference_code,
    consecutiveErrors: row.consecutive_errors,
    lastChecked: row.last_checked,
    lastPagedAt: row.last_paged_at,
  }));
}

async function postSlackMessage(
  fetchImpl: typeof globalThis.fetch,
  webhookUrl: string,
  ctx: { brand: string; sku: StalledSku; threshold: number },
): Promise<boolean> {
  const lines = [
    `:warning: *${ctx.brand} scraper stalled*`,
    `SKU: \`${ctx.sku.skuId}\`${ctx.sku.referenceCode ? ` (\`${ctx.sku.referenceCode}\`)` : ""}`,
    `Consecutive errors: *${ctx.sku.consecutiveErrors}* (threshold ${ctx.threshold})`,
    `Last checked: ${ctx.sku.lastChecked.toISOString()}`,
  ];

  try {
    const res = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: lines.join("\n") }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
