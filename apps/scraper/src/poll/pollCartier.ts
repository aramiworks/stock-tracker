import { createHash } from "node:crypto";
import type { PrismaClient } from "@stock-tracker/prisma";
import type { BrandAdapter, SkuRef } from "../brands/BrandAdapter.js";
import { getBrandAdapter } from "../brands/registry.js";
import type { Fetcher } from "../fetch/Fetcher.js";
import type { StateBuffer } from "../state/StateBuffer.js";
import type { DropEventUpsertOutput } from "../ingest/trpcClient.js";

const BRAND = "Cartier" as const;

/** Idempotency window for drop events — collapses repeat detections. */
const IDEMPOTENCY_WINDOW_MS = 10 * 60_000;

/**
 * Minimal shape of the ingest client (see ingest/trpcClient.ts). Kept structural
 * so the polling code does not depend on the stubbed concrete client — when the
 * real tRPC client lands (INF-1356/INF-1361) it satisfies this same shape.
 */
export interface IngestClient {
  tracker: {
    ingest: {
      dropEvent: {
        upsert: (input: {
          skuId: string;
          sourceUrl: string;
          detectedAt: string;
          idempotencyKey: string;
        }) => Promise<DropEventUpsertOutput>;
      };
    };
  };
}

export interface PollSkuDeps {
  fetcher: Fetcher;
  stateBuffer: StateBuffer;
  /** Optional: when absent, a transition is recorded but no drop event is emitted. */
  ingest?: IngestClient;
  /** Injectable clock for deterministic tests. */
  now?: () => Date;
}

export interface PollCartierDeps extends PollSkuDeps {
  prisma: PrismaClient;
}

export interface PollSkuResult {
  skuId: string;
  referenceCode: string;
  url: string;
  /** null when the fetch or parse failed. */
  inStock: boolean | null;
  price?: number;
  /** out-of-stock (or unknown) -> in-stock since the last check. */
  transitioned: boolean;
  /** whether a drop event was actually pushed to tracker-service. */
  dropEventEmitted: boolean;
  error?: string;
}

function idempotencyKey(skuId: string, at: Date): string {
  const window = Math.floor(at.getTime() / IDEMPOTENCY_WINDOW_MS);
  return createHash("sha256").update(`${skuId}:${window}`).digest("hex");
}

async function emitDropEvent(
  ingest: IngestClient | undefined,
  skuId: string,
  url: string,
  at: Date,
): Promise<boolean> {
  if (!ingest) {
    // Expected today: the tRPC ingest client is stubbed (INF-1356). State is
    // still recorded; the drop event lights up once the client is wired.
    console.warn(
      `[pollCartier] transition on sku ${skuId} but no ingest client configured — drop event not emitted`,
    );
    return false;
  }
  try {
    await ingest.tracker.ingest.dropEvent.upsert({
      skuId,
      sourceUrl: url,
      detectedAt: at.toISOString(),
      idempotencyKey: idempotencyKey(skuId, at),
    });
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      `[pollCartier] drop-event ingest failed for sku ${skuId} (pending INF-1356): ${message}`,
    );
    return false;
  }
}

/**
 * Poll a single Cartier SKU: build URL, fetch, parse, record state, and emit a
 * drop event on an out->in transition. Never throws — fetch/parse failures are
 * captured in the result and recorded as an error against the SKU's state.
 */
export async function pollCartierSku(
  deps: PollSkuDeps,
  adapter: BrandAdapter,
  sku: { id: string; referenceCode: string },
): Promise<PollSkuResult> {
  const now = deps.now ?? (() => new Date());
  const ref: SkuRef = {
    id: sku.id,
    brand: BRAND,
    referenceCode: sku.referenceCode,
  };
  const url = adapter.buildUrl(ref);

  try {
    const raw = await adapter.fetch(url, deps.fetcher);
    const state = adapter.parse(raw);
    const { transitioned } = await deps.stateBuffer.recordCheck(sku.id, state);

    const dropEventEmitted = transitioned
      ? await emitDropEvent(deps.ingest, sku.id, url, now())
      : false;

    return {
      skuId: sku.id,
      referenceCode: sku.referenceCode,
      url,
      inStock: state.inStock,
      ...(state.price !== undefined ? { price: state.price } : {}),
      transitioned,
      dropEventEmitted,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await deps.stateBuffer.recordError(sku.id);
    return {
      skuId: sku.id,
      referenceCode: sku.referenceCode,
      url,
      inStock: null,
      transitioned: false,
      dropEventEmitted: false,
      error: message,
    };
  }
}

/**
 * Poll every active Cartier SKU in the catalog. Drives pollCartierSku over the
 * SKUs returned from Prisma (active, with a reference code, under an active
 * Cartier watchable unit).
 */
export async function pollCartier(
  deps: PollCartierDeps,
): Promise<PollSkuResult[]> {
  const adapter = getBrandAdapter(BRAND);

  const skus = await deps.prisma.skus.findMany({
    where: {
      active: true,
      reference_code: { not: null },
      watchable_unit: { brand: BRAND, active: true },
    },
    select: { id: true, reference_code: true },
  });

  const results: PollSkuResult[] = [];
  for (const sku of skus) {
    results.push(
      await pollCartierSku(deps, adapter, {
        id: sku.id,
        referenceCode: sku.reference_code as string,
      }),
    );
  }
  return results;
}
