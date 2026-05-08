import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const paginationInputSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

export const brandSchema = z.enum([
  "Hermes",
  "Cartier",
  "Chanel",
  "Dior",
  "LouisVuitton",
  "Gucci",
  "Celine",
  "Bottega",
  "Other",
]);

export const alertChannelSchema = z.enum(["push", "email"]);

const controlCharRegex = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/;

export const sanitizedString = (maxLength: number) =>
  z
    .string()
    .max(maxLength)
    .trim()
    .refine((s) => !controlCharRegex.test(s), {
      message: "Must not contain control characters",
    });

export const dateRangeSchema = z
  .object({
    from: z.string().date().optional(),
    to: z.string().date().optional(),
  })
  .refine((r) => !r.from || !r.to || r.from <= r.to, {
    message: "dateRange.from must not be after dateRange.to",
  })
  .optional();
