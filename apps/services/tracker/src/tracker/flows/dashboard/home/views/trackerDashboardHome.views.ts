import { z } from "zod";

export const trackerDashboardHomeViews = {
  summary: {
    output: z.object({
      activeWatches: z.number().int(),
      unreadAlerts: z.number().int(),
      recentDrops: z.number().int(),
    }),
  },
};
