import type { PrismaClient } from "@stock-tracker/prisma";
import { TRPCError } from "@trpc/server";
import { trackerPurchasesManageModels } from "../models/index.js";

type PurchaseWithAccount = NonNullable<
  Awaited<
    ReturnType<ReturnType<typeof trackerPurchasesManageModels>["findById"]>
  >
>;

const mapPurchase = (
  p: PurchaseWithAccount | Omit<PurchaseWithAccount, "tracker_account">,
) => ({
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

const ensureOwnership = async (
  models: ReturnType<typeof trackerPurchasesManageModels>,
  purchaseId: string,
  userId: string,
) => {
  const purchase = await models.findById(purchaseId);
  if (!purchase) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Purchase ${purchaseId} not found`,
    });
  }
  if (purchase.tracker_account.auth_user_id !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not authorized to access this purchase",
    });
  }
  return purchase;
};

export const trackerPurchasesManageControllers = (prisma: PrismaClient) => {
  const models = trackerPurchasesManageModels(prisma);

  const ensureAccountOwnership = async (accountId: string, userId: string) => {
    const account = await prisma.tracker_accounts.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Account ${accountId} not found`,
      });
    }
    if (account.auth_user_id !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not authorized to access this account",
      });
    }
    return account;
  };

  return {
    byId: async (input: { id: string }, userId: string) => {
      const purchase = await ensureOwnership(models, input.id, userId);
      return mapPurchase(purchase);
    },

    create: async (
      input: {
        accountId: string;
        itemName: string;
        itemCategory?: string;
        amount: number;
        currency?: string;
        purchaseDate: string;
        storeLocation?: string;
        notes?: string;
      },
      userId: string,
    ) => {
      await ensureAccountOwnership(input.accountId, userId);
      const purchase = await models.create({
        trackerAccountId: input.accountId,
        itemName: input.itemName,
        itemCategory: input.itemCategory,
        amount: input.amount,
        currency: input.currency,
        purchaseDate: new Date(input.purchaseDate),
        storeLocation: input.storeLocation,
        notes: input.notes,
      });
      return mapPurchase(purchase);
    },

    update: async (
      input: {
        id: string;
        itemName?: string;
        itemCategory?: string | null;
        amount?: number;
        currency?: string;
        purchaseDate?: string;
        storeLocation?: string | null;
        notes?: string | null;
      },
      userId: string,
    ) => {
      await ensureOwnership(models, input.id, userId);
      const data: Record<string, unknown> = {};
      if (input.itemName !== undefined) data.item_name = input.itemName;
      if (input.itemCategory !== undefined)
        data.item_category = input.itemCategory;
      if (input.amount !== undefined) data.amount = input.amount;
      if (input.currency !== undefined) data.currency = input.currency;
      if (input.purchaseDate !== undefined)
        data.purchase_date = new Date(input.purchaseDate);
      if (input.storeLocation !== undefined)
        data.store_location = input.storeLocation;
      if (input.notes !== undefined) data.notes = input.notes;

      const updated = await models.update(input.id, data as never);
      return mapPurchase(updated);
    },

    delete: async (input: { id: string }, userId: string) => {
      await ensureOwnership(models, input.id, userId);
      await models.delete(input.id);
      return { success: true as const };
    },
  };
};
