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
    // Prefer the stored canonical URL when present. Cartier PDP paths vary by
    // line (Santos/Panthère/Ballon Bleu use different, sometimes Korean-encoded
    // slugs), so only Tank Must is derivable from the reference code.
    if (sku.url) return sku.url;
    return `https://www.cartier.com/ko-kr/watches/collections/tank/tank-must-de-cartier-watch-CR${sku.referenceCode}.html`;
  }

  async fetch(url: string, fetcher: Fetcher): Promise<RawResponse> {
    // No proxy: Cartier KR's Akamai is fingerprint-level, cleared by the
    // fetcher's Chrome TLS fingerprint alone. Referer overrides HttpFetcher's
    // Hermès default so the request is self-consistent for Cartier.
    return fetcher.get(url, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        Referer: "https://www.cartier.com/ko-kr/",
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
