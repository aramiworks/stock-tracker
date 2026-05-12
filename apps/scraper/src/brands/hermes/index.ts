import type {
  BrandAdapter,
  RawResponse,
  SkuRef,
  StockState,
} from "../BrandAdapter.js";
import { ParseError } from "../BrandAdapter.js";
import type { Fetcher } from "../../fetch/Fetcher.js";
import { parseHermesResponse } from "./parse.js";

export class HermesAdapter implements BrandAdapter {
  readonly brand = "Hermes" as const;

  buildUrl(sku: SkuRef): string {
    return `https://www.hermes.com/kr/ko/product/${sku.referenceCode}/`;
  }

  async fetch(url: string, fetcher: Fetcher): Promise<RawResponse> {
    return fetcher.get(url, {
      proxy: undefined as never, // caller provides proxy via fetcher binding
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });
  }

  parse(raw: RawResponse): StockState {
    try {
      return parseHermesResponse(raw);
    } catch (err) {
      if (err instanceof ParseError) throw err;
      throw new ParseError(
        err instanceof Error ? err.message : "unknown parse error",
        raw,
      );
    }
  }
}
