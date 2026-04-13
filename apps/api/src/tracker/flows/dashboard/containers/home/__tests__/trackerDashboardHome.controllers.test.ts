import { jest, describe, it, expect } from "@jest/globals";
import { trackerDashboardHomeControllers } from "../controllers/trackerDashboardHome.controllers.js";
import { Decimal } from "@prisma/client/runtime/library";

const TEST_USER_ID = "00000000-0000-0000-0000-000000000000";

const makePrisma = (
  accountCount: number,
  purchaseCount: number,
  totalSpent: Decimal | null,
) =>
  ({
    tracker_accounts: {
      count: (jest.fn() as any).mockResolvedValue(accountCount),
    },
    tracker_purchases: {
      count: (jest.fn() as any).mockResolvedValue(purchaseCount),
      aggregate: (jest.fn() as any).mockResolvedValue({
        _sum: { amount: totalSpent },
      }),
    },
  }) as any;

describe("trackerDashboardHomeControllers", () => {
  describe("summary()", () => {
    it("returns correct counts and totalSpent as string", async () => {
      const prisma = makePrisma(3, 10, new Decimal("50000000"));
      const ctrl = trackerDashboardHomeControllers(prisma);

      const result = await ctrl.summary(TEST_USER_ID);

      expect(result.totalAccounts).toBe(3);
      expect(result.totalPurchases).toBe(10);
      expect(result.totalSpent).toBe("50000000");
    });

    it("returns zeros when no data exists", async () => {
      const prisma = makePrisma(0, 0, null);
      const ctrl = trackerDashboardHomeControllers(prisma);

      const result = await ctrl.summary(TEST_USER_ID);

      expect(result.totalAccounts).toBe(0);
      expect(result.totalPurchases).toBe(0);
      expect(result.totalSpent).toBe("0");
    });
  });
});
