import type { RawResponse, StockState } from "../BrandAdapter.js";
import { ParseError } from "../BrandAdapter.js";
import { CARTIER_SELECTORS } from "./selectors.js";

const {
  addButtonComponent,
  availabilityStatusComponent,
  hiddenClass,
  pricePattern,
  currencyPattern,
} = CARTIER_SELECTORS;

/** Return the opening tag of the element carrying the given component id. */
function findComponentTag(body: string, component: string): string | null {
  const re = new RegExp(`<[^>]*data-product-component="${component}"[^>]*>`);
  const match = body.match(re);
  return match ? match[0] : null;
}

/** Whether an element's class attribute contains the `hidden` token. */
function isHidden(tag: string): boolean {
  const cls = tag.match(/class="([^"]*)"/);
  if (!cls?.[1]) return false;
  return cls[1].split(/\s+/).includes(hiddenClass);
}

/**
 * Parse a Cartier KR product page response into StockState.
 *
 * Stock signal: the `add-button` control is hidden (class contains `hidden`)
 * exactly when the item is NOT purchasable online, and the `availability-status`
 * contact-care link is its inverse. We require those two toggles to disagree;
 * if they don't — or the add-button is missing, or the response isn't a 200 —
 * we throw ParseError so the drift surfaces as a parse_errors row instead of a
 * silent wrong answer.
 */
export function parseCartierResponse(raw: RawResponse): StockState {
  if (raw.status !== 200) {
    throw new ParseError(`unexpected status ${raw.status}`, raw);
  }

  const addButton = findComponentTag(raw.body, addButtonComponent);
  if (!addButton) {
    throw new ParseError("add-button component not found", raw);
  }

  const addButtonHidden = isHidden(addButton);

  // Cross-check against the contact-care fallback when present: it must be the
  // inverse of the add-button. Equal toggles mean the page shape drifted.
  const availabilityStatus = findComponentTag(
    raw.body,
    availabilityStatusComponent,
  );
  if (availabilityStatus && isHidden(availabilityStatus) === addButtonHidden) {
    throw new ParseError("inconsistent availability toggles", raw);
  }

  const inStock = !addButtonHidden;

  const priceMatch = raw.body.match(pricePattern);
  const price = priceMatch ? Number.parseInt(priceMatch[1]!, 10) : undefined;
  const currencyMatch = raw.body.match(currencyPattern);
  const currency = currencyMatch ? currencyMatch[1] : undefined;

  return {
    inStock,
    ...(price !== undefined ? { price } : {}),
    ...(currency !== undefined ? { currency } : {}),
    // Compact forensic summary — not the full ~800KB body.
    raw: { addButtonHidden, price, currency },
  };
}
