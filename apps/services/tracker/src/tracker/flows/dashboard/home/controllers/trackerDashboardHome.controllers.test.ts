import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { Decimal } from "@prisma/client/runtime/library";
import { PrismaService } from "@stock-tracker/nestjs-common";
import { TrackerDashboardHomeModels } from "../models/index.js";
import { TrackerDashboardHomeControllers } from "./trackerDashboardHome.controllers.js";

const TEST_USER_ID = "00000000-0000-0000-0000-000000000000";

const makeMockPrisma = (
  accountCount: number,
  purchaseCount: number,
  totalSpent: Decimal | null,
) => ({
  tracker_accounts: {
    count: (jest.fn() as any).mockResolvedValue(accountCount),
  },
  tracker_purchases: {
    count: (jest.fn() as any).mockResolvedValue(purchaseCount),
    aggregate: (jest.fn() as any).mockResolvedValue({
      _sum: { amount: totalSpent },
    }),
  },
});

describe("TrackerDashboardHomeControllers", () => {
  describe("summary()", () => {
    it("returns correct counts and totalSpent as string", async () => {
      const mockPrisma = makeMockPrisma(3, 10, new Decimal("50000000"));
      const module = await Test.createTestingModule({
        providers: [
          TrackerDashboardHomeModels,
          TrackerDashboardHomeControllers,
          { provide: PrismaService, useValue: mockPrisma },
        ],
      }).compile();
      const ctrl = module.get(TrackerDashboardHomeControllers);

      const result = await ctrl.summary(TEST_USER_ID);

      expect(result.totalAccounts).toBe(3);
      expect(result.totalPurchases).toBe(10);
      expect(result.totalSpent).toBe("50000000");
    });

    it("returns zeros when no data exists", async () => {
      const mockPrisma = makeMockPrisma(0, 0, null);
      const module = await Test.createTestingModule({
        providers: [
          TrackerDashboardHomeModels,
          TrackerDashboardHomeControllers,
          { provide: PrismaService, useValue: mockPrisma },
        ],
      }).compile();
      const ctrl = module.get(TrackerDashboardHomeControllers);

      const result = await ctrl.summary(TEST_USER_ID);

      expect(result.totalAccounts).toBe(0);
      expect(result.totalPurchases).toBe(0);
      expect(result.totalSpent).toBe("0");
    });
  });
});
