import { describe, expect, it, beforeEach } from "@jest/globals";
import type { StateBuffer } from "./StateBuffer.js";
import type { StockState } from "../brands/BrandAdapter.js";

/**
 * In-memory StateBuffer mock for testing transition detection logic
 * without a real Prisma/Postgres connection.
 */
class InMemoryStateBuffer implements StateBuffer {
  private store = new Map<
    string,
    { inStock: boolean; consecutiveErrors: number }
  >();

  async read(
    skuId: string,
  ): Promise<{ inStock: boolean | null; consecutiveErrors: number }> {
    const entry = this.store.get(skuId);
    if (!entry) return { inStock: null, consecutiveErrors: 0 };
    return {
      inStock: entry.inStock,
      consecutiveErrors: entry.consecutiveErrors,
    };
  }

  async recordCheck(
    skuId: string,
    current: StockState,
  ): Promise<{ transitioned: boolean }> {
    const existing = this.store.get(skuId);
    const priorInStock = existing?.inStock ?? null;
    const transitioned =
      (priorInStock === null || priorInStock === false) && current.inStock;

    this.store.set(skuId, {
      inStock: current.inStock,
      consecutiveErrors: 0,
    });

    return { transitioned };
  }

  async recordError(skuId: string): Promise<{ consecutiveErrors: number }> {
    const existing = this.store.get(skuId);
    const errors = (existing?.consecutiveErrors ?? 0) + 1;
    this.store.set(skuId, {
      inStock: existing?.inStock ?? false,
      consecutiveErrors: errors,
    });
    return { consecutiveErrors: errors };
  }
}

describe("StateBuffer transition detection", () => {
  let buffer: InMemoryStateBuffer;

  const makeState = (inStock: boolean): StockState => ({
    inStock,
    raw: {},
  });

  beforeEach(() => {
    buffer = new InMemoryStateBuffer();
  });

  it("detects transition when SKU has no prior state and becomes in-stock", async () => {
    const result = await buffer.recordCheck("sku-1", makeState(true));
    expect(result.transitioned).toBe(true);
  });

  it("does not detect transition when SKU has no prior state and is out-of-stock", async () => {
    const result = await buffer.recordCheck("sku-1", makeState(false));
    expect(result.transitioned).toBe(false);
  });

  it("detects transition from out-of-stock to in-stock", async () => {
    await buffer.recordCheck("sku-1", makeState(false));
    const result = await buffer.recordCheck("sku-1", makeState(true));
    expect(result.transitioned).toBe(true);
  });

  it("does not detect transition when already in-stock", async () => {
    await buffer.recordCheck("sku-1", makeState(true));
    const result = await buffer.recordCheck("sku-1", makeState(true));
    expect(result.transitioned).toBe(false);
  });

  it("does not detect transition from in-stock to out-of-stock", async () => {
    await buffer.recordCheck("sku-1", makeState(true));
    const result = await buffer.recordCheck("sku-1", makeState(false));
    expect(result.transitioned).toBe(false);
  });

  it("resets consecutive errors on successful check", async () => {
    await buffer.recordError("sku-1");
    await buffer.recordError("sku-1");
    await buffer.recordCheck("sku-1", makeState(false));
    const state = await buffer.read("sku-1");
    expect(state.consecutiveErrors).toBe(0);
  });

  it("increments consecutive errors", async () => {
    const r1 = await buffer.recordError("sku-1");
    expect(r1.consecutiveErrors).toBe(1);
    const r2 = await buffer.recordError("sku-1");
    expect(r2.consecutiveErrors).toBe(2);
    const r3 = await buffer.recordError("sku-1");
    expect(r3.consecutiveErrors).toBe(3);
  });

  it("returns null inStock for unknown SKU", async () => {
    const state = await buffer.read("unknown-sku");
    expect(state.inStock).toBeNull();
    expect(state.consecutiveErrors).toBe(0);
  });
});
