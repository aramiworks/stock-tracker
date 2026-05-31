import { describe, expect, it } from "@jest/globals";
import { CartierAdapter } from "./index.js";
import { ParseError } from "../BrandAdapter.js";
import type { RawResponse, SkuRef } from "../BrandAdapter.js";
import { IN_STOCK_HTML, OUT_OF_STOCK_HTML } from "./fixtures.js";

const sku = (referenceCode: string): SkuRef => ({
  id: `id-${referenceCode}`,
  brand: "Cartier",
  referenceCode,
});

const raw = (status: number, body: string): RawResponse => ({
  status,
  body,
  headers: { "content-type": "text/html" },
});

describe("CartierAdapter", () => {
  const adapter = new CartierAdapter();

  describe("buildUrl", () => {
    it.each(["WSTA0106", "WSTA0107", "WSTA0135", "WSTA0136"])(
      "builds the Cartier KR Tank Must URL for %s",
      (code) => {
        expect(adapter.buildUrl(sku(code))).toBe(
          `https://www.cartier.com/ko-kr/watches/collections/tank/tank-must-de-cartier-watch-CR${code}.html`,
        );
      },
    );
  });

  describe("parse", () => {
    it("reports out of stock when the add-button is hidden", () => {
      const state = adapter.parse(raw(200, OUT_OF_STOCK_HTML));
      expect(state.inStock).toBe(false);
      expect(state.price).toBe(6800000);
      expect(state.currency).toBe("KRW");
    });

    it("reports in stock when the add-button is not hidden", () => {
      const state = adapter.parse(raw(200, IN_STOCK_HTML));
      expect(state.inStock).toBe(true);
      expect(state.price).toBe(1556000);
      expect(state.currency).toBe("KRW");
    });

    it("does not rely on substring presence (both fixtures share the OOS text)", () => {
      // Guards the core design decision: the OOS phrase is present in both.
      expect(IN_STOCK_HTML).toContain("현재 온라인 구매 불가");
      expect(OUT_OF_STOCK_HTML).toContain("현재 온라인 구매 불가");
    });

    it("throws ParseError when the add-button component is missing", () => {
      expect(() =>
        adapter.parse(raw(200, "<html>nothing here</html>")),
      ).toThrow(ParseError);
    });

    it("throws ParseError on a non-200 response (e.g. Akamai block)", () => {
      expect(() =>
        adapter.parse(raw(403, "<html>Access Denied</html>")),
      ).toThrow(ParseError);
    });

    it("throws ParseError when the availability toggles are inconsistent", () => {
      // add-button and contact link both hidden — page shape drifted.
      const drifted = `<html><body>
        <a data-product-component="availability-status" class="hidden">상담원 연결</a>
        <button data-product-component="add-button" class="add-to-cart hidden">쇼핑백에 추가하기</button>
      </body></html>`;
      expect(() => adapter.parse(raw(200, drifted))).toThrow(ParseError);
    });
  });
});
