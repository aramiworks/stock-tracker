import type { PrismaClient } from "@stock-tracker/prisma";

export const trackerAccountsDetailModels = (prisma: PrismaClient) => ({
  findById: async (id: string) => {
    return prisma.tracker_accounts.findUnique({
      where: { id },
      include: { tracker_purchases: { orderBy: { purchase_date: "desc" } } },
    });
  },

  update: async (
    id: string,
    data: {
      store_name?: string;
      sa_name?: string | null;
      notes?: string | null;
    },
  ) => {
    return prisma.tracker_accounts.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.tracker_accounts.delete({ where: { id } });
  },
});
