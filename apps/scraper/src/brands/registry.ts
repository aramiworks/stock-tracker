import type { BrandAdapter } from "./BrandAdapter.js";
import { HermesAdapter } from "./hermes/index.js";
import { CartierAdapter } from "./cartier/index.js";

const adapters: Record<string, () => BrandAdapter> = {
  Hermes: () => new HermesAdapter(),
  Cartier: () => new CartierAdapter(),
};

export function getBrandAdapter(brand: "Hermes" | "Cartier"): BrandAdapter {
  const factory = adapters[brand];
  if (!factory) {
    throw new Error(`Unknown brand: ${brand}`);
  }
  return factory();
}
