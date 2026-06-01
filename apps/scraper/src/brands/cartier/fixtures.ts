// Trimmed, real markup captured from cartier.com/ko-kr (2026-05-31) — the
// `actions` region the parser reads. Full pages are ~800KB; these keep only the
// price block plus the three toggled controls (add-button, availability-status
// contact link, availability-status-message) so the fixtures stay readable
// while preserving the exact class strings and `hidden` toggles that drive the
// in-stock decision.
//
// Note both fixtures contain "현재 온라인 구매 불가" and the add-to-cart button
// markup — the ONLY difference is which controls carry the `hidden` class. This
// is exactly why the parser keys on the toggle, not on substring presence.

// Out of stock: Tank Must WSTA0106 (online-unavailable watch).
// add-button HAS `hidden`; availability-status contact link does NOT.
export const OUT_OF_STOCK_HTML = `<html><body>
<div class="price flex--inline" data-product-component="price" itemprop="offers" itemscope itemtype="http://schema.org/Offer">
  <meta itemprop="priceCurrency" content="KRW" />
  <span class="price__sales sales">
    <span class="value" itemprop="price" content="6800000"> ₩6,800,000 </span>
  </span>
</div>
<a class="product-add__button add-to-cart button button--primary button--fluid set--w-100  "
   data-pid="CRWSTA0106" data-product-component="availability-status"
   href="/ko-kr/contact-customer-care"> 상담원 연결 </a>
<p class="font-family--serif status-available hidden" data-product-component="availability-status-message"> 현재 온라인 구매 불가 </p>
<button class="product-add__button add-to-cart button button--primary button--fluid set--w-100 hidden "
   data-pid="CRWSTA0106" data-product-component="add-button"
   data-url="/on/demandware.store/Sites-CartierKR-Site/ko_KR/Cart-AddProduct"> 쇼핑백에 추가하기 </button>
</body></html>`;

// In stock: fragrance CRFH030038 (purchasable online).
// add-button does NOT have `hidden` (it is `disabled` pending size selection,
// which does not affect the signal); availability-status contact link HAS it.
export const IN_STOCK_HTML = `<html><body>
<div class="price flex--inline" data-product-component="price" itemprop="offers" itemscope itemtype="http://schema.org/Offer">
  <meta itemprop="priceCurrency" content="KRW" />
  <span class="price__sales sales">
    <span class="value" itemprop="price" content="1556000"> ₩1,556,000 </span>
  </span>
</div>
<a class="product-add__button add-to-cart button button--primary button--fluid set--w-100  hidden"
   data-pid="CRFH030038" data-product-component="availability-status"
   href="/ko-kr/contact-customer-care"> 상담원 연결 </a>
<p class="font-family--serif status-available hidden" data-product-component="availability-status-message"> 현재 온라인 구매 불가 </p>
<button class="product-add__button add-to-cart button button--primary button--fluid set--w-100  case-refill-req hide-select-size"
   disabled data-pid="CRFH030038" data-product-component="add-button"
   data-url="/on/demandware.store/Sites-CartierKR-Site/ko_KR/Cart-AddProduct"> 쇼핑백에 추가하기 </button>
</body></html>`;
