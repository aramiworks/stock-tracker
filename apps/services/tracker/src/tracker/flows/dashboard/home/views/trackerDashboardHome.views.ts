import { z } from "zod";

export const trackerDashboardHomeViews = {
  summary: {
    output: z.object({
      totalAccounts: z.number().int(),
      totalPurchases: z.number().int(),
      totalSpent: z.string(),
    }),
  },
};
