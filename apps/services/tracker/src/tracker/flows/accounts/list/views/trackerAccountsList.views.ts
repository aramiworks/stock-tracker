import { z } from "zod";
import {
  accountCreateInputSchema,
  accountOutputSchema,
  sortOrderSchema,
  sanitizedString,
} from "@stock-tracker/validation";

export const trackerAccountsListViews = {
  all: {
    input: z.object({
      sortBy: z.enum(["store_name", "created_at"]).default("created_at"),
      sortOrder: sortOrderSchema,
      search: sanitizedString(100).optional(),
    }),
    output: z.array(accountOutputSchema),
  },
  create: {
    input: accountCreateInputSchema,
    output: accountOutputSchema,
  },
};
