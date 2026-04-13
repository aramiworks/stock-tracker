import type { PrismaClient } from "@stock-tracker/prisma";

export const trackerPurchasesManageModels = (prisma: PrismaClient) => ({
  findById: async (id: string) => {
    return prisma.tracker_purchases.findUnique({
      where: { id },
      include: { tracker_account: true },
    });
  },

  create: async (data: {
    trackerAccountId: string;
    itemName: string;
    itemCategory?: string;
    amount: number;
    currency?: string;
    purchaseDate: Date;
    storeLocation?: string;
    notes?: string;
  }) => {
    return prisma.tracker_purchases.create({
      data: {
        tracker_account_id: data.trackerAccountId,
        item_name: data.itemName,
        item_category: data.itemCategory,
        amount: data.amount,
        currency: data.currency,
        purchase_date: data.purchaseDate,
        store_location: data.storeLocation,
        notes: data.notes,
      },
    });
  },

  update: async (
    id: string,
    data: {
      item_name?: string;
      item_category?: string | null;
      amount?: number;
      currency?: string;
      purchase_date?: Date;
      store_location?: string | null;
      notes?: string | null;
    },
  ) => {
    return prisma.tracker_purchases.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.tracker_purchases.delete({ where: { id } });
  },
});
