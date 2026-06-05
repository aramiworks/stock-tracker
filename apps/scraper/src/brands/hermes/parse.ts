import type { RawResponse, StockState } from "../BrandAdapter.js";
import { ParseError } from "../BrandAdapter.js";
import { isDataDomeInterstitial } from "../../fetch/datadome.js";

/**
 * Parse a Hermès KR product page response into StockState.
 *
 * Stock is read from the page's JSON-LD `"availability"` field, and ONLY from a
 * status-200 body. Two rules from the INF-1602 validation (30/30 live bags):
 *
 *   1. STATUS-GATED — a DataDome interstitial, a 404, or any non-200 is NOT a
 *      stock state; it's a fetch failure. We throw ParseError so pollHermes
 *      records it as an error (and the parse-error reporter can capture it)
 *      rather than mislabeling a blocked/dead page as "out of stock."
 *   2. FIRST-OCCURRENCE — a live page repeats `"availability"` for every item in
 *      its recommendations carousel. Only the FIRST match is the product's own
 *      offer; later ones belong to unrelated products. (The Korean add-to-cart
 *      label `장바구니` is NOT a signal — it renders on sold-out pages too.)
 */
export function parseHermesResponse(raw: RawResponse): StockState {
  const { status, body } = raw;

  if (status === 404) {
    throw new ParseError("http 404 (gone)", raw);
  }
  if (status !== 200) {
    if (isDataDomeInterstitial(body)) {
      throw new ParseError("blocked: datadome interstitial", raw);
    }
    throw new ParseError(`http ${status}`, raw);
  }

  // A challenge can ride a 200 too — treat it as blocked, never as stock data.
  if (isDataDomeInterstitial(body)) {
    throw new ParseError("blocked: datadome interstitial", raw);
  }

  const match = body.match(/"availability"\s*:\s*"([^"]+)"/i);
  const availability = match?.[1];
  if (!availability) {
    throw new ParseError("no availability in 200 body", raw);
  }

  if (/InStock/i.test(availability)) {
    return { inStock: true, raw };
  }
  if (/OutOfStock|SoldOut|Discontinued/i.test(availability)) {
    return { inStock: false, raw };
  }

  throw new ParseError(`unrecognized availability: ${availability}`, raw);
}
