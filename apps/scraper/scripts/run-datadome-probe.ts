/**
 * DataDome diagnostic probe (INF-1507).
 *
 * The Akamai probe revealed hermes.com/kr is NOT behind Akamai — the block
 * page loads `ct.captcha-delivery.com/c.js` (DataDome) behind Cloudflare
 * (`__cf_bm`). There is no `_abck` cookie. Before building a CapSolver
 * DataDome solve, this probe captures the EXACT challenge so the solver
 * request is built against reality, not a guess.
 *
 * It answers:
 *   1. What status + cookies does the first GET return? (Cloudflare vs DataDome)
 *   2. Is a `datadome` cookie set? (DataDome's session cookie)
 *   3. Does the body carry a DataDome `dd` config object or a captcha URL?
 *      (CapSolver's DatadomeSliderTask needs the geo.captcha-delivery.com URL)
 *
 * Usage:
 *   DOPPLER_PROJECT=stock-tracker DOPPLER_CONFIG=develop doppler run -- \
 *     npx tsx apps/scraper/scripts/run-datadome-probe.ts
 */
import { getProxyFromEnv, buildProxyAuth } from "../src/fetch/proxy.js";

const TARGET =
  "https://www.hermes.com/kr/ko/product/picotin-lock-18-%EB%B0%B1-H056289CC37/";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const ORIGIN = "https://www.hermes.com";

const BASE_HEADERS: Record<string, string> = {
  "User-Agent": UA,
  "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Sec-CH-UA":
    '"Chromium";v="131", "Google Chrome";v="131", "Not_A Brand";v="24"',
  "Sec-CH-UA-Mobile": "?0",
  "Sec-CH-UA-Platform": '"macOS"',
};

/** Pull a DataDome captcha URL out of the block body, if present. */
function findDataDomeCaptchaUrl(body: string): string | null {
  // JSON block: {"url":"https://geo.captcha-delivery.com/captcha/?..."}
  const jsonMatch = body.match(
    /"url"\s*:\s*"(https:\\?\/\\?\/geo\.captcha-delivery\.com\/[^"]+)"/i,
  );
  if (jsonMatch?.[1]) return jsonMatch[1].replace(/\\\//g, "/");
  // Plain occurrence anywhere in the HTML/JS.
  const plain = body.match(
    /https:\/\/geo\.captcha-delivery\.com\/captcha\/\?[^\s"'<>]+/i,
  );
  return plain?.[0] ?? null;
}

/** Extract the inline DataDome `dd` config object literal, if present. */
function findDdObject(body: string): string | null {
  const m = body.match(/var\s+dd\s*=\s*(\{[^}]*\})/i);
  return m?.[1] ?? null;
}

async function main(): Promise<void> {
  const { gotScraping } = await import("got-scraping");
  const proxy = getProxyFromEnv();
  const auth = buildProxyAuth(proxy);
  const proxyUrl = `http://${auth.username}:${auth.password}@${proxy.host}:${proxy.port}`;

  console.log(`Target: ${TARGET}`);
  console.log(
    `Proxy:  ${proxy.host}:${proxy.port} (cc=${proxy.countryCode})\n`,
  );

  const r = await gotScraping({
    url: TARGET,
    proxyUrl,
    responseType: "text",
    headers: { ...BASE_HEADERS, Referer: `${ORIGIN}/kr/ko/` },
    throwHttpErrors: false,
    retry: { limit: 0 },
    timeout: { request: 30_000 },
  });

  console.log("── Response ────────────────────────────────");
  console.log(`status: ${r.statusCode}`);
  console.log(`body length: ${r.body.length}`);

  console.log("\n── Telltale headers ────────────────────────");
  const interesting = [
    "server",
    "cf-ray",
    "cf-mitigated",
    "x-datadome",
    "x-dd-b",
    "set-cookie",
    "content-type",
  ];
  for (const key of interesting) {
    const v = r.headers[key];
    if (v) console.log(`${key}: ${Array.isArray(v) ? v.join(" | ") : v}`);
  }

  console.log("\n── Cookies set ─────────────────────────────");
  const setCookie = r.headers["set-cookie"] ?? [];
  const cookieNames = setCookie.map((c) => c.split("=")[0]!.trim());
  console.log(`names: ${cookieNames.join(", ") || "(none)"}`);
  const hasDatadome = cookieNames.includes("datadome");
  const hasCf = cookieNames.some((n) => n.startsWith("__cf"));
  console.log(`datadome cookie present: ${hasDatadome}`);
  console.log(`cloudflare cookie present: ${hasCf}`);

  console.log("\n── DataDome challenge ──────────────────────");
  const captchaUrl = findDataDomeCaptchaUrl(r.body);
  const ddObject = findDdObject(r.body);
  console.log(`captcha URL: ${captchaUrl ?? "NOT FOUND"}`);
  console.log(`dd config:   ${ddObject ?? "NOT FOUND"}`);

  console.log("\n── Body head (first 1200 chars) ────────────");
  console.log(r.body.slice(0, 1200));

  console.log("\n========================================");
  if (captchaUrl) {
    console.log(
      "VERDICT: DataDome captcha challenge present — CapSolver DatadomeSliderTask is the right tool.",
    );
  } else if (hasCf && r.statusCode === 403) {
    console.log(
      "VERDICT: Cloudflare 403 (no DataDome captcha URL surfaced) — may be a Cloudflare-layer block before DataDome.",
    );
  } else if (r.statusCode >= 200 && r.statusCode < 400) {
    console.log("VERDICT: Page loaded — no block on this request.");
  } else {
    console.log(
      "VERDICT: Blocked, but no DataDome captcha URL found in body — inspect body head above.",
    );
  }
  console.log("========================================");
}

main().catch((err) => {
  console.error("PROBE FAILED:", err);
  process.exit(1);
});
