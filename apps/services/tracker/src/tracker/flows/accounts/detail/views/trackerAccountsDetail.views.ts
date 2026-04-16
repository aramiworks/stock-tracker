import { z } from "zod";
import {
  uuidSchema,
  accountOutputSchema,
  accountUpdateInputSchema,
  accountWithPurchasesOutputSchema,
} from "@stock-tracker/validation";

export const trackerAccountsDetailViews = {
  byId: {
    input: z.object({ id: uuidSchema }),
    output: accountWithPurchasesOutputSchema,
  },
  update: {
    input: accountUpdateInputSchema,
    output: accountOutputSchema,
  },
  delete: {
    input: z.object({ id: uuidSchema }),
    output: z.object({ success: z.boolean() }),
  },
};
