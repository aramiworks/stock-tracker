import { describe, expect, it } from "@jest/globals";
import { HermesAdapter } from "./index.js";
import { ParseError } from "../BrandAdapter.js";
import type { RawResponse, SkuRef } from "../BrandAdapter.js";

describe("HermesAdapter", () => {
  const adapter = new HermesAdapter();

  describe("buildUrl", () => {
    it("builds the correct Hermès KR product URL", () => {
      const sku: SkuRef = {
        id: "abc-123",
        brand: "Hermes",
        referenceCode: "H077782CC89",
      };
      expect(adapter.buildUrl(sku)).toBe(
        "https://www.hermes.com/kr/ko/product/H077782CC89/",
      );
    });
  });

  describe("parse", () => {
    it("reads stock state from JSON-LD availability on a 200", () => {
      const inStock: RawResponse = {
        status: 200,
        body: `<script type="application/ld+json">{"offers":{"availability":"http://schema.org/InStock"}}</script>`,
        headers: { "content-type": "text/html" },
      };
      expect(adapter.parse(inStock).inStock).toBe(true);

      const outOfStock: RawResponse = {
        ...inStock,
        body: inStock.body.replace("InStock", "OutOfStock"),
      };
      expect(adapter.parse(outOfStock).inStock).toBe(false);
    });

    it("throws ParseError on a blocked / non-200 response", () => {
      const raw: RawResponse = {
        status: 403,
        body: "<html>var dd={'t':'fe'}</html>",
        headers: { "content-type": "text/html" },
      };
      expect(() => adapter.parse(raw)).toThrow(ParseError);
    });
  });
});
