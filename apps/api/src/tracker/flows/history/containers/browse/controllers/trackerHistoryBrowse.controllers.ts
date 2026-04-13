import type { PrismaClient } from "@stock-tracker/prisma";
import { trackerHistoryBrowseModels } from "../models/index.js";

type PurchaseWithAccount = Awaited<
  ReturnType<ReturnType<typeof trackerHistoryBrowseModels>["list"]>
>[number];

const mapPurchaseWithAccount = (p: PurchaseWithAccount) => ({
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
  trackerAccount: {
    id: p.tracker_account.id,
    storeName: p.tracker_account.store_name,
  },
});

export const trackerHistoryBrowseControllers = (prisma: PrismaClient) => {
  const models = trackerHistoryBrowseModels(prisma);

  return {
    list: async (
      input: {
        accountId?: string;
        cursor?: string;
        limit: number;
        sortOrder: "asc" | "desc";
        dateRange?: { from?: string; to?: string };
        amountRange?: { min?: number; max?: number };
        itemCategory?: string;
        search?: string;
      },
      userId: string,
    ) => {
      const results = await models.list({ ...input, userId });

      let nextCursor: string | null = null;
      if (results.length > input.limit) {
        const nextItem = results.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        items: results.map(mapPurchaseWithAccount),
        nextCursor,
      };
    },
  };
};
