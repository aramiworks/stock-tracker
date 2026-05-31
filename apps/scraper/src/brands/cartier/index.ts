import type {
  BrandAdapter,
  RawResponse,
  SkuRef,
  StockState,
} from "../BrandAdapter.js";
import { ParseError } from "../BrandAdapter.js";
import type { Fetcher } from "../../fetch/Fetcher.js";
import { parseCartierResponse } from "./parse.js";

export class CartierAdapter implements BrandAdapter {
  readonly brand = "Cartier" as const;

  buildUrl(sku: SkuRef): string {
    // Cartier KR Tank Must product pages share one collection + slug; only the
    // CR-prefixed reference code varies (WSTA0106/0107/0135/0136).
    return `https://www.cartier.com/ko-kr/watches/collections/tank/tank-must-de-cartier-watch-CR${sku.referenceCode}.html`;
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
      return parseCartierResponse(raw);
    } catch (err) {
      if (err instanceof ParseError) throw err;
      throw new ParseError(
        err instanceof Error ? err.message : "unknown parse error",
        raw,
      );
    }
  }
}
