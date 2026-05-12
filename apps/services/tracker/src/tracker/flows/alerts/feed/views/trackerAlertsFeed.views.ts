import { z } from "zod";
import {
  uuidSchema,
  paginationInputSchema,
  alertWithDetailsOutputSchema,
} from "@stock-tracker/validation";

export const trackerAlertsFeedViews = {
  list: {
    input: z
      .object({
        unreadOnly: z.boolean().default(false),
      })
      .merge(paginationInputSchema),
    output: z.object({
      items: z.array(alertWithDetailsOutputSchema),
      nextCursor: z.string().uuid().nullable(),
    }),
  },
  markRead: {
    input: z.object({ id: uuidSchema }),
    output: z.object({ success: z.boolean() }),
  },
  unreadCount: {
    output: z.object({ count: z.number().int() }),
  },
};
