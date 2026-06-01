/**
 * Discover a LIVE Hermès KR product URL (INF-1507 helper).
 *
 * The curated bake-test URLs are adapted from US reference codes and 404.
 * To verify the CapSolver DataDome bypass on a real 200 product page, we first
 * need a currently-live product URL. This walks a few category listing pages
 * through the Oxylabs KR proxy and prints the product links it finds.
 *
 * Usage:
 *   DOPPLER_PROJECT=stock-tracker DOPPLER_CONFIG=develop doppler run -- \
 *     npx tsx apps/scraper/scripts/find-live-product.ts
 */
import { getProxyFromEnv, buildProxyAuth } from "../src/fetch/proxy.js";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36";

const CATEGORY_URLS = [
  "https://www.hermes.com/kr/ko/category/women/bags-and-small-leather-goods/bags-and-clutches/",
  "https://www.hermes.com/kr/ko/category/women/shoes/",
  "https://www.hermes.com/kr/ko/category/women/",
];

function extractProductPaths(html: string): string[] {
  const set = new Set<string>();
  // Slugs contain RAW (unencoded) Korean chars + underscores, e.g.
  // /kr/ko/product/mini-maillon-이어링-H100052FP12/ — match any non-quote run.
  for (const m of html.matchAll(/\/kr\/ko\/product\/[^"'\s<>]+\//gi)) {
    set.add(m[0]);
  }
  return [...set];
}

async function main(): Promise<void> {
  const { gotScraping } = await import("got-scraping");
  const proxy = getProxyFromEnv();
  const auth = buildProxyAuth(proxy);
  const proxyUrl = `http://${auth.username}:${auth.password}@${proxy.host}:${proxy.port}`;

  for (const url of CATEGORY_URLS) {
    const r = await gotScraping({
      url,
      proxyUrl,
      responseType: "text",
      headers: {
        "User-Agent": UA,
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        Referer: "https://www.hermes.com/kr/ko/",
      },
      throwHttpErrors: false,
      retry: { limit: 0 },
      timeout: { request: 30_000 },
    });
    const paths = extractProductPaths(r.body);
    console.log(
      `\n${url}\n  status=${r.statusCode}  bodyLen=${r.body.length}  products=${paths.length}`,
    );
    // Diagnostic: where do product references actually live in the markup?
    const counts = {
      "/product": (r.body.match(/\/product/gi) ?? []).length,
      sku: (r.body.match(/"sku"/gi) ?? []).length,
      productId: (r.body.match(/productId|product_id/gi) ?? []).length,
      __NEXT_DATA__: r.body.includes("__NEXT_DATA__"),
      "window.__INITIAL": /window\.__[A-Z_]+\s*=/.test(r.body),
      "json+ld product": /"@type"\s*:\s*"Product"/i.test(r.body),
    };
    console.log(`  diag: ${JSON.stringify(counts)}`);
    // Sample any href/url containing "product"
    const sample = [
      ...new Set(
        [...r.body.matchAll(/["']([^"']*product[^"']*)["']/gi)]
          .map((m) => m[1]!)
          .filter((s) => s.length < 120),
      ),
    ].slice(0, 10);
    for (const s of sample) console.log(`    sample: ${s}`);
    for (const p of paths.slice(0, 8)) {
      console.log(`    https://www.hermes.com${p}`);
    }
    if (paths.length > 0) return; // first category with products is enough
  }
}

main().catch((err) => {
  console.error("DISCOVERY FAILED:", err);
  process.exit(1);
});
