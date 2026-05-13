import { z } from "zod";

export const trackerIngestDropEventViews = {
  upsert: {
    input: z.object({
      skuId: z.string().uuid(),
      sourceUrl: z.string().url(),
      detectedAt: z.string().datetime(),
      idempotencyKey: z.string().min(16),
    }),
    output: z.object({
      dropEventId: z.string().uuid(),
      alertsCreated: z.number().int().nonnegative(),
    }),
  },
};
