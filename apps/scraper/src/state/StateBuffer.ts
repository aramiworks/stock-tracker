import type { PrismaClient } from "@stock-tracker/prisma";
import type { StockState } from "../brands/BrandAdapter.js";

export interface StateBuffer {
  read(skuId: string): Promise<{
    inStock: boolean | null;
    consecutiveErrors: number;
  }>;
  recordCheck(
    skuId: string,
    current: StockState,
  ): Promise<{ transitioned: boolean }>;
  recordError(skuId: string): Promise<{ consecutiveErrors: number }>;
}

export class PrismaStateBuffer implements StateBuffer {
  constructor(private readonly prisma: PrismaClient) {}

  async read(
    skuId: string,
  ): Promise<{ inStock: boolean | null; consecutiveErrors: number }> {
    const state = await this.prisma.sku_stock_state.findUnique({
      where: { sku_id: skuId },
    });
    if (!state) {
      return { inStock: null, consecutiveErrors: 0 };
    }
    return {
      inStock: state.in_stock,
      consecutiveErrors: state.consecutive_errors,
    };
  }

  async recordCheck(
    skuId: string,
    current: StockState,
  ): Promise<{ transitioned: boolean }> {
    const now = new Date();
    const existing = await this.prisma.sku_stock_state.findUnique({
      where: { sku_id: skuId },
    });

    const priorInStock = existing?.in_stock ?? null;
    const transitioned =
      (priorInStock === null || priorInStock === false) && current.inStock;
    const changed = priorInStock !== current.inStock;

    await this.prisma.sku_stock_state.upsert({
      where: { sku_id: skuId },
      create: {
        sku_id: skuId,
        in_stock: current.inStock,
        last_checked: now,
        last_changed: now,
        consecutive_errors: 0,
      },
      update: {
        in_stock: current.inStock,
        last_checked: now,
        ...(changed ? { last_changed: now } : {}),
        consecutive_errors: 0,
      },
    });

    return { transitioned };
  }

  async recordError(skuId: string): Promise<{ consecutiveErrors: number }> {
    const now = new Date();
    const result = await this.prisma.sku_stock_state.upsert({
      where: { sku_id: skuId },
      create: {
        sku_id: skuId,
        in_stock: false,
        last_checked: now,
        last_changed: now,
        consecutive_errors: 1,
      },
      update: {
        last_checked: now,
        consecutive_errors: { increment: 1 },
      },
    });

    return { consecutiveErrors: result.consecutive_errors };
  }
}
