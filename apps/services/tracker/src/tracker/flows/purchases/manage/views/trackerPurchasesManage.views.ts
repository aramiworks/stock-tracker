import { z } from "zod";
import {
  uuidSchema,
  purchaseCreateInputSchema,
  purchaseUpdateInputSchema,
  purchaseOutputSchema,
} from "@stock-tracker/validation";

export const trackerPurchasesManageViews = {
  byId: {
    input: z.object({ id: uuidSchema }),
    output: purchaseOutputSchema,
  },
  create: {
    input: purchaseCreateInputSchema.extend({ accountId: uuidSchema }),
    output: purchaseOutputSchema,
  },
  update: {
    input: purchaseUpdateInputSchema.extend({ id: uuidSchema }),
    output: purchaseOutputSchema,
  },
  delete: {
    input: z.object({ id: uuidSchema }),
    output: z.object({ success: z.boolean() }),
  },
};
