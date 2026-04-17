import { z } from "zod";
import {
  uuidSchema,
  paginationInputSchema,
  sortOrderSchema,
  purchaseWithAccountOutputSchema,
  dateRangeSchema,
  amountRangeSchema,
  itemCategorySchema,
  sanitizedString,
} from "@stock-tracker/validation";

export const trackerHistoryBrowseViews = {
  list: {
    input: z
      .object({
        accountId: uuidSchema.optional(),
        sortOrder: sortOrderSchema,
        dateRange: dateRangeSchema,
        amountRange: amountRangeSchema,
        itemCategory: itemCategorySchema.optional(),
        search: sanitizedString(100).optional(),
      })
      .merge(paginationInputSchema),
    output: z.object({
      items: z.array(purchaseWithAccountOutputSchema),
      nextCursor: z.string().uuid().nullable(),
    }),
  },
};
