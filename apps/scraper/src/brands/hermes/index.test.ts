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
    it("throws ParseError on stub input (not yet implemented)", () => {
      const raw: RawResponse = {
        status: 200,
        body: "<html>test</html>",
        headers: { "content-type": "text/html" },
      };
      expect(() => adapter.parse(raw)).toThrow(ParseError);
      expect(() => adapter.parse(raw)).toThrow("not implemented");
    });
  });
});
