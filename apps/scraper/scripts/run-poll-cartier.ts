/**
 * Local runner that demonstrates the Cartier poll pipeline against LIVE pages,
 * with no database or proxy. Uses the real CartierAdapter + HttpFetcher and an
 * in-memory StateBuffer, driving the same pollCartierSku used by the Trigger.dev
 * task. Prints stock + price per seeded SKU.
 *
 * Usage: npx tsx apps/scraper/scripts/run-poll-cartier.ts
 */
import type { StockState } from "../src/brands/BrandAdapter.js";
import type { StateBuffer } from "../src/state/StateBuffer.js";
import { getBrandAdapter } from "../src/brands/registry.js";
import { HttpFetcher } from "../src/fetch/HttpFetcher.js";
import { pollCartierSku } from "../src/poll/pollCartier.js";

// The 4 seeded Cartier SKUs (packages/prisma/prisma/seed-catalog.ts).
const SEEDED = [
  { id: "WSTA0106", referenceCode: "WSTA0106" },
  { id: "WSTA0107", referenceCode: "WSTA0107" },
  { id: "WSTA0135", referenceCode: "WSTA0135" },
  { id: "WSTA0136", referenceCode: "WSTA0136" },
];

function memoryStateBuffer(): StateBuffer {
  const states = new Map<string, boolean>();
  return {
    async read(skuId) {
      return { inStock: states.get(skuId) ?? null, consecutiveErrors: 0 };
    },
    async recordCheck(skuId, current: StockState) {
      const prior = states.get(skuId) ?? null;
      const transitioned =
        (prior === null || prior === false) && current.inStock;
      states.set(skuId, current.inStock);
      return { transitioned };
    },
    async recordError() {
      return { consecutiveErrors: 1 };
    },
  };
}

const adapter = getBrandAdapter("Cartier");
const deps = { fetcher: new HttpFetcher(), stateBuffer: memoryStateBuffer() };

console.log("Polling seeded Cartier catalog (live, no proxy)...\n");

for (const sku of SEEDED) {
  const r = await pollCartierSku(deps, adapter, sku);
  const stock = r.inStock === null ? "ERROR" : r.inStock ? "IN STOCK" : "out";
  const price = r.price ? `₩${r.price.toLocaleString("en-US")}` : "—";
  console.log(
    `  ${sku.referenceCode.padEnd(10)} ${stock.padEnd(9)} ${price.padEnd(13)}` +
      `${r.transitioned ? " [transition]" : ""}${r.error ? ` (${r.error})` : ""}`,
  );
}

console.log("\nDone.");
