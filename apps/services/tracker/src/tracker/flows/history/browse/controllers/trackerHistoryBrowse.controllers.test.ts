import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { Decimal } from "@prisma/client/runtime/library";
import { PrismaService } from "@stock-tracker/nestjs-common";
import { TrackerHistoryBrowseModels } from "../models/index.js";
import { TrackerHistoryBrowseControllers } from "./trackerHistoryBrowse.controllers.js";

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

describe("TrackerHistoryBrowseControllers", () => {
  let ctrl: TrackerHistoryBrowseControllers;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      tracker_purchases: {
        findMany: (jest.fn() as any).mockResolvedValue([]),
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        TrackerHistoryBrowseModels,
        TrackerHistoryBrowseControllers,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    ctrl = module.get(TrackerHistoryBrowseControllers);
  });

  describe("list()", () => {
    it("returns items with nextCursor when more results exist", async () => {
      const purchases = [
        makeMockPurchase("pur-1"),
        makeMockPurchase("pur-2"),
        makeMockPurchase("pur-3"),
      ];
      mockPrisma.tracker_purchases.findMany.mockResolvedValue(purchases);

      const result = await ctrl.list(
        { limit: 2, sortOrder: "desc" },
        TEST_USER_ID,
      );

      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBe("pur-3");
    });

    it("returns items with null nextCursor on last page", async () => {
      const purchases = [makeMockPurchase("pur-1"), makeMockPurchase("pur-2")];
      mockPrisma.tracker_purchases.findMany.mockResolvedValue(purchases);

      const result = await ctrl.list(
        { limit: 2, sortOrder: "desc" },
        TEST_USER_ID,
      );

      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
    });

    it("returns empty items when no results", async () => {
      const result = await ctrl.list(
        { limit: 10, sortOrder: "desc" },
        TEST_USER_ID,
      );

      expect(result.items).toEqual([]);
      expect(result.nextCursor).toBeNull();
    });

    it("passes accountId filter to model", async () => {
      await ctrl.list(
        { accountId: ACCOUNT_ID, limit: 10, sortOrder: "desc" },
        TEST_USER_ID,
      );

      expect(mockPrisma.tracker_purchases.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tracker_account_id: ACCOUNT_ID,
          }),
        }),
      );
    });

    it("passes cursor to model for pagination", async () => {
      await ctrl.list(
        { cursor: "pur-5", limit: 10, sortOrder: "asc" },
        TEST_USER_ID,
      );

      expect(mockPrisma.tracker_purchases.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: "pur-5" },
          skip: 1,
        }),
      );
    });

    it("maps purchase fields correctly", async () => {
      mockPrisma.tracker_purchases.findMany.mockResolvedValue([
        makeMockPurchase("pur-1"),
      ]);

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
