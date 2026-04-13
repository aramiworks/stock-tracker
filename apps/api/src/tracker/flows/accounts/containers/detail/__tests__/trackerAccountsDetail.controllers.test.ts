import { jest, describe, it, expect } from "@jest/globals";
import { TRPCError } from "@trpc/server";
import { trackerAccountsDetailControllers } from "../controllers/trackerAccountsDetail.controllers.js";
import { Decimal } from "@prisma/client/runtime/library";

const now = new Date("2025-01-01T00:00:00Z");
const TEST_USER_ID = "00000000-0000-0000-0000-000000000000";
const OTHER_USER_ID = "11111111-1111-1111-1111-111111111111";
const ACCOUNT_ID = "acc-001";

const mockDbPurchase = {
  id: "pur-001",
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
};

const mockDbAccount = {
  id: ACCOUNT_ID,
  auth_user_id: TEST_USER_ID,
  store_name: "Test Store",
  sa_name: "Test SA",
  notes: "some notes",
  created_at: now,
  updated_at: now,
  tracker_purchases: [mockDbPurchase],
};

const makePrisma = () =>
  ({
    tracker_accounts: {
      findUnique: (jest.fn() as any).mockResolvedValue(mockDbAccount),
      update: (jest.fn() as any).mockImplementation(({ data }: { data: any }) =>
        Promise.resolve({
          ...mockDbAccount,
          ...data,
          tracker_purchases: undefined,
        }),
      ),
      delete: (jest.fn() as any).mockResolvedValue(mockDbAccount),
    },
  }) as any;

describe("trackerAccountsDetailControllers", () => {
  describe("byId()", () => {
    it("returns a mapped account with purchases", async () => {
      const prisma = makePrisma();
      const ctrl = trackerAccountsDetailControllers(prisma);

      const result = await ctrl.byId({ id: ACCOUNT_ID }, TEST_USER_ID);

      expect(result.id).toBe(ACCOUNT_ID);
      expect(result.storeName).toBe("Test Store");
      expect(result.saName).toBe("Test SA");
      expect(result.purchases).toHaveLength(1);
      expect(result.purchases[0]!.id).toBe("pur-001");
      expect(result.purchases[0]!.itemName).toBe("Test Ring");
      expect(result.purchases[0]!.amount).toBe("5000000");
    });

    it("throws NOT_FOUND for missing account", async () => {
      const prisma = makePrisma();
      (prisma.tracker_accounts.findUnique as any).mockResolvedValue(null);
      const ctrl = trackerAccountsDetailControllers(prisma);

      await expect(ctrl.byId({ id: "missing" }, TEST_USER_ID)).rejects.toThrow(
        TRPCError,
      );
    });

    it("throws FORBIDDEN for wrong owner", async () => {
      const prisma = makePrisma();
      const ctrl = trackerAccountsDetailControllers(prisma);

      await expect(
        ctrl.byId({ id: ACCOUNT_ID }, OTHER_USER_ID),
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("update()", () => {
    it("updates an account with partial fields", async () => {
      const prisma = makePrisma();
      const ctrl = trackerAccountsDetailControllers(prisma);

      const result = await ctrl.update(
        { id: ACCOUNT_ID, storeName: "Updated Store" },
        TEST_USER_ID,
      );

      expect(prisma.tracker_accounts.update).toHaveBeenCalled();
      expect(result.id).toBe(ACCOUNT_ID);
    });

    it("throws NOT_FOUND for missing account", async () => {
      const prisma = makePrisma();
      (prisma.tracker_accounts.findUnique as any).mockResolvedValue(null);
      const ctrl = trackerAccountsDetailControllers(prisma);

      await expect(
        ctrl.update({ id: "missing", storeName: "X" }, TEST_USER_ID),
      ).rejects.toThrow(TRPCError);
    });

    it("throws FORBIDDEN for wrong owner", async () => {
      const prisma = makePrisma();
      const ctrl = trackerAccountsDetailControllers(prisma);

      await expect(
        ctrl.update({ id: ACCOUNT_ID, storeName: "X" }, OTHER_USER_ID),
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("delete()", () => {
    it("deletes an account", async () => {
      const prisma = makePrisma();
      const ctrl = trackerAccountsDetailControllers(prisma);

      const result = await ctrl.delete({ id: ACCOUNT_ID }, TEST_USER_ID);

      expect(result.success).toBe(true);
      expect(prisma.tracker_accounts.delete).toHaveBeenCalledWith({
        where: { id: ACCOUNT_ID },
      });
    });

    it("throws NOT_FOUND for missing account", async () => {
      const prisma = makePrisma();
      (prisma.tracker_accounts.findUnique as any).mockResolvedValue(null);
      const ctrl = trackerAccountsDetailControllers(prisma);

      await expect(
        ctrl.delete({ id: "missing" }, TEST_USER_ID),
      ).rejects.toThrow(TRPCError);
    });

    it("throws FORBIDDEN for wrong owner", async () => {
      const prisma = makePrisma();
      const ctrl = trackerAccountsDetailControllers(prisma);

      await expect(
        ctrl.delete({ id: ACCOUNT_ID }, OTHER_USER_ID),
      ).rejects.toThrow(TRPCError);
    });
  });
});
