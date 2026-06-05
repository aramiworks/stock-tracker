import { describe, expect, it } from "@jest/globals";
import { parseHermesResponse } from "./parse.js";
import { ParseError } from "../BrandAdapter.js";
import type { RawResponse } from "../BrandAdapter.js";

function res(status: number, body: string): RawResponse {
  return { status, body, headers: {} };
}

const IN_STOCK_LD = `<script type="application/ld+json">{"@type":"Product","offers":{"@type":"Offer","availability":"http://schema.org/InStock"}}</script>`;
const OUT_OF_STOCK_LD = `<script type="application/ld+json">{"@type":"Product","offers":{"@type":"Offer","availability":"http://schema.org/OutOfStock"}}</script>`;

// A DataDome interstitial body — the inline `dd` object / captcha-delivery c.js.
const INTERSTITIAL = `<html><head><script>var dd={'cid':'x','hsh':'y','t':'fe','s':1,'e':'z','host':'h','cookie':'c'}</script><script src="https://ct.captcha-delivery.com/c.js"></script></head></html>`;

describe("parseHermesResponse", () => {
  it("reads InStock from a 200 body", () => {
    expect(parseHermesResponse(res(200, IN_STOCK_LD)).inStock).toBe(true);
  });

  it("reads OutOfStock from a 200 body", () => {
    expect(parseHermesResponse(res(200, OUT_OF_STOCK_LD)).inStock).toBe(false);
  });

  it("trusts the FIRST availability (product offer), ignoring carousel items", () => {
    // The product's own offer is InStock; a later recommendations-carousel item
    // is OutOfStock. First-occurrence wins.
    const body = `${IN_STOCK_LD}<div>recommendations</div>${OUT_OF_STOCK_LD}`;
    expect(parseHermesResponse(res(200, body)).inStock).toBe(true);
  });

  it("carries the raw response through for forensics", () => {
    const raw = res(200, IN_STOCK_LD);
    expect(parseHermesResponse(raw).raw).toBe(raw);
  });

  it("throws ParseError on a 200 with no availability (schema drift)", () => {
    expect(() => parseHermesResponse(res(200, "<html>no ld</html>"))).toThrow(
      ParseError,
    );
  });

  it("throws ParseError on a DataDome interstitial (200 or non-200)", () => {
    expect(() => parseHermesResponse(res(403, INTERSTITIAL))).toThrow(
      /datadome interstitial/,
    );
    // A challenge riding a 200 is still a block, never stock data.
    expect(() => parseHermesResponse(res(200, INTERSTITIAL))).toThrow(
      /datadome interstitial/,
    );
  });

  it("throws ParseError on a 404 (dead URL is not a stock state)", () => {
    expect(() => parseHermesResponse(res(404, "<html>gone</html>"))).toThrow(
      /404/,
    );
  });

  it("throws ParseError on any other non-200", () => {
    expect(() => parseHermesResponse(res(500, "<html>oops</html>"))).toThrow(
      ParseError,
    );
  });
});
