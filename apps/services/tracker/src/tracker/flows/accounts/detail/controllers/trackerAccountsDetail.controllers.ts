import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import { TrackerAccountsDetailModels } from "../models/index.js";

type AccountWithPurchases = NonNullable<
  Awaited<ReturnType<TrackerAccountsDetailModels["findById"]>>
>;

const mapPurchase = (p: AccountWithPurchases["tracker_purchases"][number]) => ({
  id: p.id,
  trackerAccountId: p.tracker_account_id,
  itemName: p.item_name,
  itemCategory: p.item_category,
  amount: p.amount.toString(),
  currency: p.currency,
  purchaseDate: p.purchase_date,
  storeLocation: p.store_location,
  notes: p.notes,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
});

@Injectable()
export class TrackerAccountsDetailControllers {
  constructor(private readonly models: TrackerAccountsDetailModels) {}

  async byId(input: { id: string }, userId: string) {
    const account = await this.models.findById(input.id);
    if (!account) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Account ${input.id} not found`,
      });
    }
    if (account.auth_user_id !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not authorized to access this account",
      });
    }
    return {
      id: account.id,
      authUserId: account.auth_user_id,
      storeName: account.store_name,
      saName: account.sa_name,
      notes: account.notes,
      createdAt: account.created_at,
      updatedAt: account.updated_at,
      purchases: account.tracker_purchases.map(mapPurchase),
    };
  }

  async update(
    input: {
      id: string;
      storeName?: string;
      saName?: string | null;
      notes?: string | null;
    },
    userId: string,
  ) {
    const existing = await this.models.findById(input.id);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Account ${input.id} not found`,
      });
    }
    if (existing.auth_user_id !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not authorized to modify this account",
      });
    }
    const data: Record<string, unknown> = {};
    if (input.storeName !== undefined) data.store_name = input.storeName;
    if (input.saName !== undefined) data.sa_name = input.saName;
    if (input.notes !== undefined) data.notes = input.notes;

    const updated = await this.models.update(input.id, data as never);
    return {
      id: updated.id,
      authUserId: updated.auth_user_id,
      storeName: updated.store_name,
      saName: updated.sa_name,
      notes: updated.notes,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };
  }

  async delete(input: { id: string }, userId: string) {
    const existing = await this.models.findById(input.id);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Account ${input.id} not found`,
      });
    }
    if (existing.auth_user_id !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not authorized to delete this account",
      });
    }
    await this.models.delete(input.id);
    return { success: true as const };
  }
}
