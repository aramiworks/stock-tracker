import { z } from "zod";
import { productLineSchema, sanitizedString } from "./common.js";

// -- WatchableUnit ---------------------------------------------------------

export const watchableUnitOutputSchema = z.object({
  id: z.string().uuid(),
  brand: z.string(),
  productLine: z.string(),
  modelName: z.string(),
  imageUrl: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const watchableUnitWithSkusOutputSchema =
  watchableUnitOutputSchema.extend({
    skus: z.array(
      z.object({
        id: z.string().uuid(),
        color: z.string(),
        leather: z.string().nullable(),
        hardware: z.string().nullable(),
        size: z.string().nullable(),
        referenceCode: z.string().nullable(),
        imageUrl: z.string().nullable(),
        active: z.boolean(),
      }),
    ),
  });

// -- Sku -------------------------------------------------------------------

export const skuOutputSchema = z.object({
  id: z.string().uuid(),
  watchableUnitId: z.string().uuid(),
  color: z.string(),
  leather: z.string().nullable(),
  hardware: z.string().nullable(),
  size: z.string().nullable(),
  referenceCode: z.string().nullable(),
  imageUrl: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// -- Catalog browse input --------------------------------------------------

export const catalogBrowseInputSchema = z.object({
  productLine: productLineSchema.optional(),
  search: sanitizedString(100).optional(),
  activeOnly: z.boolean().default(true),
});
