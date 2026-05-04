import { z } from "zod";
import {
  uuidSchema,
  catalogBrowseInputSchema,
  watchableUnitWithSkusOutputSchema,
} from "@stock-tracker/validation";

export const trackerCatalogBrowseViews = {
  list: {
    input: catalogBrowseInputSchema,
    output: z.array(watchableUnitWithSkusOutputSchema),
  },
  byId: {
    input: z.object({ id: uuidSchema }),
    output: watchableUnitWithSkusOutputSchema,
  },
};
