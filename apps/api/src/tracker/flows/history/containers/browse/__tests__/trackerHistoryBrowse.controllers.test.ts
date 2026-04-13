import { jest, describe, it, expect } from "@jest/globals";
import { trackerHistoryBrowseControllers } from "../controllers/trackerHistoryBrowse.controllers.js";
import { Decimal } from "@prisma/client/runtime/library";

const now = new Date("2025-01-01T00:00:00Z");
const TEST_USER_ID = "00000000-0000-0000-0000-000000000000";
const ACCOUNT_ID = "acc-001";

const makeMockPurchase = (id: string) => ({
  id,
  tracker_account_id: ACCOUNT_ID,
  item_name: `Item ${id}`,
  item_category: "Ring",
  amount: new Decimal("5000000"),
  currency: "KRW",
  purchase_date: new Date("2025-01-15"),
  store_location: null,
  notes: null,
  created_at: now,
  updated_at: now,
  tracker_account: {
    id: ACCOUNT_ID,
    store_name: "Test Store",
  },
});

const makePrisma = (mockResults: ReturnType<typeof makeMockPurchase>[]) =>
  ({
    tracker_purchases: {
      findMany: (jest.fn() as any).mockResolvedValue(mockResults),
    },
  }) as any;

describe("trackerHistoryBrowseControllers", () => {
  describe("list()", () => {
    it("returns items with nextCursor when more results exist", async () => {
      const purchases = [
        makeMockPurchase("pur-1"),
        makeMockPurchase("pur-2"),
        makeMockPurchase("pur-3"),
      ];
      const prisma = makePrisma(purchases);
      const ctrl = trackerHistoryBrowseControllers(prisma);

      const result = await ctrl.list(
        { limit: 2, sortOrder: "desc" },
        TEST_USER_ID,
      );

      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBe("pur-3");
    });

    it("returns items with null nextCursor on last page", async () => {
      const purchases = [makeMockPurchase("pur-1"), makeMockPurchase("pur-2")];
      const prisma = makePrisma(purchases);
      const ctrl = trackerHistoryBrowseControllers(prisma);

      const result = await ctrl.list(
        { limit: 2, sortOrder: "desc" },
        TEST_USER_ID,
      );

      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
    });

    it("returns empty items when no results", async () => {
      const prisma = makePrisma([]);
      const ctrl = trackerHistoryBrowseControllers(prisma);

      const result = await ctrl.list(
        { limit: 10, sortOrder: "desc" },
        TEST_USER_ID,
      );

      expect(result.items).toEqual([]);
      expect(result.nextCursor).toBeNull();
    });

    it("passes accountId filter to model", async () => {
      const prisma = makePrisma([]);
      const ctrl = trackerHistoryBrowseControllers(prisma);

      await ctrl.list(
        { accountId: ACCOUNT_ID, limit: 10, sortOrder: "desc" },
        TEST_USER_ID,
      );

      expect(prisma.tracker_purchases.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tracker_account_id: ACCOUNT_ID,
          }),
        }),
      );
    });

    it("passes cursor to model for pagination", async () => {
      const prisma = makePrisma([]);
      const ctrl = trackerHistoryBrowseControllers(prisma);

      await ctrl.list(
        { cursor: "pur-5", limit: 10, sortOrder: "asc" },
        TEST_USER_ID,
      );

      expect(prisma.tracker_purchases.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: "pur-5" },
          skip: 1,
        }),
      );
    });

    it("maps purchase fields correctly", async () => {
      const prisma = makePrisma([makeMockPurchase("pur-1")]);
      const ctrl = trackerHistoryBrowseControllers(prisma);

      const result = await ctrl.list(
        { limit: 10, sortOrder: "desc" },
        TEST_USER_ID,
      );

      const item = result.items[0]!;
      expect(item.id).toBe("pur-1");
      expect(item.itemName).toBe("Item pur-1");
      expect(item.amount).toBe("5000000");
      expect(item.trackerAccount.id).toBe(ACCOUNT_ID);
      expect(item.trackerAccount.storeName).toBe("Test Store");
    });
  });
});
