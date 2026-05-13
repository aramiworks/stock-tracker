import { z } from "zod";
import {
  uuidSchema,
  watchCreateInputSchema,
  watchUpdateInputSchema,
  watchWithCatalogOutputSchema,
  watchlistListOutputSchema,
  watchlistAddInputSchema,
  watchlistRemoveInputSchema,
  watchlistRemoveOutputSchema,
  watchlistDetailInputSchema,
  watchlistDetailOutputSchema,
  watchlistEntryOutputSchema,
} from "@stock-tracker/validation";

export const trackerWatchlistManageViews = {
  list: {
    output: z.array(watchWithCatalogOutputSchema),
  },
  create: {
    input: watchCreateInputSchema,
    output: watchWithCatalogOutputSchema,
  },
  update: {
    input: watchUpdateInputSchema,
    output: watchWithCatalogOutputSchema,
  },
  delete: {
    input: z.object({ id: uuidSchema }),
    output: z.object({ success: z.boolean() }),
  },
  // -- INF-1415: Hermès-style watchlist procedures --------------------------
  listGrouped: {
    output: watchlistListOutputSchema,
  },
  detail: {
    input: watchlistDetailInputSchema,
    output: watchlistDetailOutputSchema,
  },
  add: {
    input: watchlistAddInputSchema,
    output: watchlistEntryOutputSchema,
  },
  remove: {
    input: watchlistRemoveInputSchema,
    output: watchlistRemoveOutputSchema,
  },
};
