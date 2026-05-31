// Markers for parsing Cartier KR product pages (cartier.com/ko-kr).
//
// Cartier KR ships BOTH the add-to-cart control and the out-of-stock fallback
// in every product page's server HTML, toggling which one is shown with the
// `hidden` class client-side. Online purchasability is therefore determined by
// whether the `add-button` component carries `hidden` — NOT by substring
// presence of any Korean status text (e.g. "현재 온라인 구매 불가" is present in
// the HTML even when the item IS purchasable, just hidden) and NOT by the
// schema.org / dataLayer availability (which reports boutique stock — it reads
// "instock" on a page that is online-unavailable).
export const CARTIER_SELECTORS = {
  // Add-to-cart button. Visible (class lacks `hidden`) only when the item is
  // purchasable online; carries `hidden` when it is not.
  addButtonComponent: "add-button",
  // Contact-customer-care fallback link. The inverse of add-button: visible
  // only when the item is NOT purchasable online.
  availabilityStatusComponent: "availability-status",
  // Class token toggled client-side to show/hide a control.
  hiddenClass: "hidden",
  // schema.org Offer price: <span itemprop="price" content="6800000">.
  pricePattern: /itemprop="price"\s+content="(\d+)"/,
  // schema.org Offer currency: <meta itemprop="priceCurrency" content="KRW" />.
  currencyPattern: /itemprop="priceCurrency"\s+content="([A-Z]{3})"/,
} as const;
