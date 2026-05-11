export interface StockState {
  inStock: boolean;
  price?: number;
  currency?: string;
  raw: unknown; // for parse-error forensics
}

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly raw: unknown,
  ) {
    super(message);
    this.name = "ParseError";
  }
}

export interface RawResponse {
  status: number;
  body: string;
  headers: Record<string, string>;
}

export interface SkuRef {
  id: string;
  brand: "Hermes" | "Cartier";
  referenceCode: string;
}

export interface BrandAdapter {
  brand: "Hermes" | "Cartier";
  buildUrl(sku: SkuRef): string;
  fetch(url: string, fetcher: Fetcher): Promise<RawResponse>;
  parse(raw: RawResponse): StockState; // throws ParseError on schema drift
}

// Avoid circular import — re-export the Fetcher type used in BrandAdapter
import type { Fetcher } from "../fetch/Fetcher.js";
export type { Fetcher };
