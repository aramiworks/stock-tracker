import {
  userOutputSchema,
  userUpsertInputSchema,
} from "@stock-tracker/validation";

export const authViews = {
  me: {
    output: userOutputSchema.nullable(),
  },
  upsert: {
    input: userUpsertInputSchema,
    output: userOutputSchema,
  },
};
