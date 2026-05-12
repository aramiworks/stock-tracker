import { z } from "zod";
import {
  uuidSchema,
  catalogBrowseInputSchema,
  catalogListOutputSchema,
  catalogPageOutputSchema,
  watchableUnitWithSkusOutputSchema,
} from "@stock-tracker/validation";

export const trackerCatalogBrowseViews = {
  list: {
    input: catalogBrowseInputSchema,
    output: catalogPageOutputSchema,
  },
  byId: {
    input: z.object({ id: uuidSchema }),
    output: watchableUnitWithSkusOutputSchema,
  },
  listGrouped: {
    output: catalogListOutputSchema,
  },
};
