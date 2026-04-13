import type { PrismaClient } from "@stock-tracker/prisma";
import { trackerAccountsListModels } from "../models/index.js";

const mapAccount = (a: {
  id: string;
  auth_user_id: string;
  store_name: string;
  sa_name: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}) => ({
  id: a.id,
  authUserId: a.auth_user_id,
  storeName: a.store_name,
  saName: a.sa_name,
  notes: a.notes,
  createdAt: a.created_at,
  updatedAt: a.updated_at,
});

export const trackerAccountsListControllers = (prisma: PrismaClient) => {
  const models = trackerAccountsListModels(prisma);

  return {
    all: async (
      input: {
        sortBy: "store_name" | "created_at";
        sortOrder: "asc" | "desc";
        search?: string;
      },
      userId: string,
    ) => {
      const accounts = await models.findAll({ userId, ...input });
      return accounts.map(mapAccount);
    },

    create: async (
      input: {
        storeName: string;
        saName?: string;
        notes?: string;
      },
      userId: string,
    ) => {
      const account = await models.create({
        authUserId: userId,
        ...input,
      });
      return mapAccount(account);
    },
  };
};
