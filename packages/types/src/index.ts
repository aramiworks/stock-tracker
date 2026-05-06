import type { z } from "zod";
import type {
  watchableUnitOutputSchema,
  skuOutputSchema,
  watchOutputSchema,
  alertOutputSchema,
  dropEventOutputSchema,
  userOutputSchema,
} from "@stock-tracker/validation";

export type WatchableUnit = z.infer<typeof watchableUnitOutputSchema>;
export type Sku = z.infer<typeof skuOutputSchema>;
export type Watch = z.infer<typeof watchOutputSchema>;
export type Alert = z.infer<typeof alertOutputSchema>;
export type DropEvent = z.infer<typeof dropEventOutputSchema>;
export type User = z.infer<typeof userOutputSchema>;
