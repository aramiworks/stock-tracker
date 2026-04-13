import { jest, describe, it, expect } from "@jest/globals";
import { trackerAccountsListControllers } from "../controllers/trackerAccountsList.controllers.js";

const now = new Date("2025-01-01T00:00:00Z");
const TEST_USER_ID = "00000000-0000-0000-0000-000000000000";
const OTHER_USER_ID = "11111111-1111-1111-1111-111111111111";

const mockDbAccount = {
  id: "acc-001",
  auth_user_id: TEST_USER_ID,
  store_name: "Test Store",
  sa_name: "Test SA",
  notes: "some notes",
  created_at: now,
  updated_at: now,
};

const makePrisma = () =>
  ({
    tracker_accounts: {
      findMany: (jest.fn() as any).mockResolvedValue([mockDbAccount]),
      create: (jest.fn() as any).mockImplementation(
        ({ data }: { data: any }) => {
          return Promise.resolve({
            id: "new-acc-id",
            auth_user_id: data.auth_user_id,
            store_name: data.store_name,
            sa_name: data.sa_name ?? null,
            notes: data.notes ?? null,
            created_at: now,
            updated_at: now,
          });
        },
      ),
    },
  }) as any;

describe("trackerAccountsListControllers", () => {
  describe("all()", () => {
    it("returns mapped accounts from database", async () => {
      const prisma = makePrisma();
      const ctrl = trackerAccountsListControllers(prisma);

      const result = await ctrl.all(
        { sortBy: "created_at", sortOrder: "desc" },
        TEST_USER_ID,
      );

      expect(prisma.tracker_accounts.findMany).toHaveBeenCalledWith({
        where: { auth_user_id: TEST_USER_ID },
        orderBy: { created_at: "desc" },
      });
      expect(result).toEqual([
        {
          id: "acc-001",
          authUserId: mockDbAccount.auth_user_id,
          storeName: "Test Store",
          saName: "Test SA",
          notes: "some notes",
          createdAt: now,
          updatedAt: now,
        },
      ]);
    });

    it("returns empty array when no accounts exist", async () => {
      const prisma = makePrisma();
      (prisma.tracker_accounts.findMany as any).mockResolvedValue([]);
      const ctrl = trackerAccountsListControllers(prisma);

      const result = await ctrl.all(
        { sortBy: "created_at", sortOrder: "desc" },
        TEST_USER_ID,
      );

      expect(result).toEqual([]);
    });

    it("filters by userId for user isolation", async () => {
      const prisma = makePrisma();
      const ctrl = trackerAccountsListControllers(prisma);

      await ctrl.all(
        { sortBy: "created_at", sortOrder: "desc" },
        OTHER_USER_ID,
      );

      expect(prisma.tracker_accounts.findMany).toHaveBeenCalledWith({
        where: { auth_user_id: OTHER_USER_ID },
        orderBy: { created_at: "desc" },
      });
    });
  });

  describe("create()", () => {
    it("creates an account with required fields", async () => {
      const prisma = makePrisma();
      const ctrl = trackerAccountsListControllers(prisma);

      const result = await ctrl.create(
        { storeName: "New Store" },
        TEST_USER_ID,
      );

      expect(prisma.tracker_accounts.create).toHaveBeenCalledWith({
        data: {
          auth_user_id: TEST_USER_ID,
          store_name: "New Store",
          sa_name: undefined,
          notes: undefined,
        },
      });
      expect(result).toMatchObject({
        id: "new-acc-id",
        storeName: "New Store",
      });
    });

    it("creates an account with all optional fields", async () => {
      const prisma = makePrisma();
      const ctrl = trackerAccountsListControllers(prisma);

      const result = await ctrl.create(
        {
          storeName: "Full Store",
          saName: "SA Name",
          notes: "detailed notes",
        },
        TEST_USER_ID,
      );

      expect(prisma.tracker_accounts.create).toHaveBeenCalledWith({
        data: {
          auth_user_id: TEST_USER_ID,
          store_name: "Full Store",
          sa_name: "SA Name",
          notes: "detailed notes",
        },
      });
      expect(result).toMatchObject({
        storeName: "Full Store",
        saName: "SA Name",
        notes: "detailed notes",
      });
    });
  });
});
