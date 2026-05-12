import type { RawResponse, StockState } from "../BrandAdapter.js";
import { ParseError } from "../BrandAdapter.js";

/**
 * Parse a Hermès KR product page response into StockState.
 *
 * Real implementation lands when INF-1360 spike provides captured fixtures.
 * Until then, this throws ParseError to signal "not yet implemented."
 */
export function parseHermesResponse(raw: RawResponse): StockState {
  throw new ParseError("not implemented", raw);
}
