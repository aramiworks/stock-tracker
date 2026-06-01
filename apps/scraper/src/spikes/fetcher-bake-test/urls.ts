/**
 * LIVE Hermès KR product URLs for the fetcher bake test.
 *
 * Snapshot discovered 2026-06-01 by scraping the bags-and-clutches category
 * page (see scripts/find-live-product.ts). The previous curated list was
 * adapted from US reference codes and 404'd — stale product paths draw a
 * DataDome challenge, so the bake test must run against currently-live URLs.
 *
 * Slugs contain RAW (unencoded) Korean — callers must encodeURI() before fetch.
 * These go stale as Hermès rotates inventory; re-run find-live-product.ts to
 * refresh. (Dynamic catalog discovery is a separate workstream.)
 */
export const BAKE_TEST_URLS: readonly string[] = [
  "https://www.hermes.com/kr/ko/product/halzan-25-verso-백-H082660CKBD/",
  "https://www.hermes.com/kr/ko/product/bolide-1923-verso-미니-백-H077817CKBK/",
  "https://www.hermes.com/kr/ko/product/arcon-백-H084853CKAB/",
  "https://www.hermes.com/kr/ko/product/jypsiere-미니-백-H084049CKAA/",
  "https://www.hermes.com/kr/ko/product/hermes-perspective-cavaliere-28-백-H082917CKAC/",
  "https://www.hermes.com/kr/ko/product/faubourg-express-백-H086338CK89/",
  "https://www.hermes.com/kr/ko/product/evelyne-iii-29-백-H056277CKD2/",
  "https://www.hermes.com/kr/ko/product/hermes-della-cavalleria-미니-백-ii-H085367CK10/",
  // Homepage control (always 200, no product parsing needed).
  "https://www.hermes.com/kr/ko/",
];
