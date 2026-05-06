import { z } from "zod";

// -- Watch (user subscription to restock alerts) ---------------------------

export const watchCreateInputSchema = z.object({
  watchableUnitId: z.string().uuid(),
  skuId: z.string().uuid().optional(),
  notifyPush: z.boolean().default(true),
  notifyEmail: z.boolean().default(false),
});

export const watchUpdateInputSchema = z.object({
  id: z.string().uuid(),
  notifyPush: z.boolean().optional(),
  notifyEmail: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const watchOutputSchema = z.object({
  id: z.string().uuid(),
  authUserId: z.string().uuid(),
  watchableUnitId: z.string().uuid(),
  skuId: z.string().uuid().nullable(),
  notifyPush: z.boolean(),
  notifyEmail: z.boolean(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const watchWithCatalogOutputSchema = watchOutputSchema.extend({
  watchableUnit: z.object({
    id: z.string().uuid(),
    brand: z.string(),
    productLine: z.string(),
    modelName: z.string(),
    imageUrl: z.string().nullable(),
  }),
  sku: z
    .object({
      id: z.string().uuid(),
      color: z.string(),
      leather: z.string().nullable(),
      hardware: z.string().nullable(),
      size: z.string().nullable(),
    })
    .nullable(),
});

// -- Alert (notification sent to user) -------------------------------------

export const alertOutputSchema = z.object({
  id: z.string().uuid(),
  watchId: z.string().uuid(),
  dropEventId: z.string().uuid(),
  channel: z.string(),
  sentAt: z.date().nullable(),
  readAt: z.date().nullable(),
  createdAt: z.date(),
});

export const alertWithDetailsOutputSchema = alertOutputSchema.extend({
  dropEvent: z.object({
    id: z.string().uuid(),
    skuId: z.string().uuid(),
    sourceUrl: z.string().nullable(),
    detectedAt: z.date(),
  }),
});

// -- DropEvent (scraper-detected restock) ----------------------------------

export const dropEventOutputSchema = z.object({
  id: z.string().uuid(),
  skuId: z.string().uuid(),
  sourceUrl: z.string().nullable(),
  detectedAt: z.date(),
  expiredAt: z.date().nullable(),
});
