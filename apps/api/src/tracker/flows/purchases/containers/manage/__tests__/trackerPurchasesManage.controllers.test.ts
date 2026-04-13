import { jest, describe, it, expect } from "@jest/globals";
import { TRPCError } from "@trpc/server";
import { trackerPurchasesManageControllers } from "../controllers/trackerPurchasesManage.controllers.js";
import { Decimal } from "@prisma/client/runtime/library";

const now = new Date("2025-01-01T00:00:00Z");
const TEST_USER_ID = "00000000-0000-0000-0000-000000000000";
const OTHER_USER_ID = "11111111-1111-1111-1111-111111111111";
const ACCOUNT_ID = "acc-001";
const PURCHASE_ID = "pur-001";

const mockDbAccount = {
  id: ACCOUNT_ID,
  auth_user_id: TEST_USER_ID,
  store_name: "Test Store",
  sa_name: null,
  notes: null,
  created_at: now,
  updated_at: now,
};

const mockDbPurchase = {
  id: PURCHASE_ID,
  tracker_account_id: ACCOUNT_ID,
  item_name: "Test Ring",
  item_category: "Ring",
  amount: new Decimal("5000000"),
  currency: "KRW",
  purchase_date: new Date("2025-01-15"),
  store_location: null,
  notes: null,
  created_at: now,
  updated_at: now,
  tracker_account: mockDbAccount,
};

const makePrisma = () =>
  ({
    tracker_purchases: {
      findUnique: (jest.fn() as any).mockResolvedValue(mockDbPurchase),
      create: (jest.fn() as any).mockImplementation(({ data }: { data: any }) =>
        Promise.resolve({
          id: "new-pur-id",
          tracker_account_id: data.tracker_account_id,
          item_name: data.item_name,
          item_category: data.item_category ?? null,
          amount: new Decimal(String(data.amount ?? 0)),
          currency: data.currency ?? "KRW",
          purchase_date: data.purchase_date,
          store_location: data.store_location ?? null,
          notes: data.notes ?? null,
          created_at: now,
          updated_at: now,
        }),
      ),
      update: (jest.fn() as any).mockImplementation(({ data }: { data: any }) =>
        Promise.resolve({
          ...mockDbPurchase,
          ...data,
          tracker_account: undefined,
        }),
      ),
      delete: (jest.fn() as any).mockResolvedValue(mockDbPurchase),
    },
    tracker_accounts: {
      findUnique: (jest.fn() as any).mockResolvedValue(mockDbAccount),
    },
  }) as any;

describe("trackerPurchasesManageControllers", () => {
  describe("byId()", () => {
    it("returns a mapped purchase", async () => {
      const prisma = makePrisma();
      const ctrl = trackerPurchasesManageControllers(prisma);

      const result = await ctrl.byId({ id: PURCHASE_ID }, TEST_USER_ID);

      expect(result.id).toBe(PURCHASE_ID);
      expect(result.itemName).toBe("Test Ring");
      expect(result.amount).toBe("5000000");
    });

    it("throws NOT_FOUND for missing purchase", async () => {
      const prisma = makePrisma();
      (prisma.tracker_purchases.findUnique as any).mockResolvedValue(null);
      const ctrl = trackerPurchasesManageControllers(prisma);

      await expect(ctrl.byId({ id: "missing" }, TEST_USER_ID)).rejects.toThrow(
        TRPCError,
      );
    });

    it("throws FORBIDDEN for wrong owner", async () => {
      const prisma = makePrisma();
      const ctrl = trackerPurchasesManageControllers(prisma);

      await expect(
        ctrl.byId({ id: PURCHASE_ID }, OTHER_USER_ID),
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("create()", () => {
    it("creates a purchase for owned account", async () => {
      const prisma = makePrisma();
      const ctrl = trackerPurchasesManageControllers(prisma);

      const result = await ctrl.create(
        {
          accountId: ACCOUNT_ID,
          itemName: "New Bracelet",
          amount: 3000000,
          purchaseDate: "2025-02-01",
        },
        TEST_USER_ID,
      );

      expect(result.id).toBe("new-pur-id");
      expect(result.itemName).toBe("New Bracelet");
      expect(prisma.tracker_purchases.create).toHaveBeenCalled();
    });

    it("throws NOT_FOUND for missing account", async () => {
      const prisma = makePrisma();
      (prisma.tracker_accounts.findUnique as any).mockResolvedValue(null);
      const ctrl = trackerPurchasesManageControllers(prisma);

      await expect(
        ctrl.create(
          {
            accountId: "missing",
            itemName: "Ring",
            amount: 1000,
            purchaseDate: "2025-01-01",
          },
          TEST_USER_ID,
        ),
      ).rejects.toThrow(TRPCError);
    });

    it("throws FORBIDDEN for account owned by another user", async () => {
      const prisma = makePrisma();
      const ctrl = trackerPurchasesManageControllers(prisma);

      await expect(
        ctrl.create(
          {
            accountId: ACCOUNT_ID,
            itemName: "Ring",
            amount: 1000,
            purchaseDate: "2025-01-01",
          },
          OTHER_USER_ID,
        ),
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("update()", () => {
    it("updates a purchase", async () => {
      const prisma = makePrisma();
      const ctrl = trackerPurchasesManageControllers(prisma);

      const result = await ctrl.update(
        { id: PURCHASE_ID, itemName: "Updated Ring" },
        TEST_USER_ID,
      );

      expect(prisma.tracker_purchases.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("throws NOT_FOUND for missing purchase", async () => {
      const prisma = makePrisma();
      (prisma.tracker_purchases.findUnique as any).mockResolvedValue(null);
      const ctrl = trackerPurchasesManageControllers(prisma);

      await expect(
        ctrl.update({ id: "missing", itemName: "X" }, TEST_USER_ID),
      ).rejects.toThrow(TRPCError);
    });

    it("throws FORBIDDEN for wrong owner", async () => {
      const prisma = makePrisma();
      const ctrl = trackerPurchasesManageControllers(prisma);

      await expect(
        ctrl.update({ id: PURCHASE_ID, itemName: "X" }, OTHER_USER_ID),
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("delete()", () => {
    it("deletes a purchase", async () => {
      const prisma = makePrisma();
      const ctrl = trackerPurchasesManageControllers(prisma);

      const result = await ctrl.delete({ id: PURCHASE_ID }, TEST_USER_ID);

      expect(result.success).toBe(true);
      expect(prisma.tracker_purchases.delete).toHaveBeenCalledWith({
        where: { id: PURCHASE_ID },
      });
    });

    it("throws NOT_FOUND for missing purchase", async () => {
      const prisma = makePrisma();
      (prisma.tracker_purchases.findUnique as any).mockResolvedValue(null);
      const ctrl = trackerPurchasesManageControllers(prisma);

      await expect(
        ctrl.delete({ id: "missing" }, TEST_USER_ID),
      ).rejects.toThrow(TRPCError);
    });

    it("throws FORBIDDEN for wrong owner", async () => {
      const prisma = makePrisma();
      const ctrl = trackerPurchasesManageControllers(prisma);

      await expect(
        ctrl.delete({ id: PURCHASE_ID }, OTHER_USER_ID),
      ).rejects.toThrow(TRPCError);
    });
  });
});
