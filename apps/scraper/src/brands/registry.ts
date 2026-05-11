import type { BrandAdapter } from "./BrandAdapter.js";
import { HermesAdapter } from "./hermes/index.js";

const adapters: Record<string, () => BrandAdapter> = {
  Hermes: () => new HermesAdapter(),
};

export function getBrandAdapter(brand: "Hermes" | "Cartier"): BrandAdapter {
  const factory = adapters[brand];
  if (!factory) {
    throw new Error(`Unknown brand: ${brand}`);
  }
  return factory();
}
