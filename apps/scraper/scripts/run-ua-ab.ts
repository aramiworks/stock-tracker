/**
 * UA A/B against DataDome (INF-1507).
 *
 * The multi-session probe got 8/8 clean 200s on a live product page with a
 * Windows Chrome 143 UA, after earlier runs (macOS Chrome 131) hit the 403
 * DataDome interstitial. This isolates the lever: is the UA/client-hint
 * freshness what flips challenge → clean? Runs N fresh KR sticky sessions for
 * each UA variant against the SAME live URL and reports the challenge rate.
 *
 * Usage:
 *   DOPPLER_PROJECT=stock-tracker DOPPLER_CONFIG=develop doppler run -- \
 *     npx tsx apps/scraper/scripts/run-ua-ab.ts
 */
import { getProxyFromEnv } from "../src/fetch/proxy.js";
import { isAkamaiBlocked } from "../src/fetch/HttpFetcher.js";

const TARGET =
  "https://www.hermes.com/kr/ko/product/halzan-25-verso-%EB%B0%B1-H082660CKBD/";
const ORIGIN = "https://www.hermes.com";
const N = 6;

interface Variant {
  label: string;
  ua: string;
  secChUa: string;
  platform: string;
}

const VARIANTS: Variant[] = [
  {
    label: "macOS Chrome 131 (old)",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    secChUa:
      '"Chromium";v="131", "Google Chrome";v="131", "Not_A Brand";v="24"',
    platform: '"macOS"',
  },
  {
    label: "Windows Chrome 143 (new)",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
    secChUa:
      '"Chromium";v="143", "Google Chrome";v="143", "Not_A Brand";v="24"',
    platform: '"Windows"',
  },
];

function challenged(body: string): boolean {
  return (
    body.includes("var dd=") ||
    body.includes("captcha-delivery.com/c.js") ||
    isAkamaiBlocked(body)
  );
}

async function main(): Promise<void> {
  const { gotScraping } = await import("got-scraping");
  const proxy = getProxyFromEnv();

  console.log(`Target: ${TARGET}`);
  console.log(`${N} fresh KR sticky sessions per UA variant\n`);

  for (const v of VARIANTS) {
    let clean = 0;
    let blocked = 0;
    for (let i = 0; i < N; i++) {
      const sessId = Math.random().toString(36).slice(2, 12);
      const stickyUser = `${proxy.username}-cc-${proxy.countryCode}-sessid-${sessId}-sesstime-10`;
      const proxyUrl = `http://${stickyUser}:${proxy.password}@${proxy.host}:${proxy.port}`;
      const r = await gotScraping({
        url: TARGET,
        proxyUrl,
        responseType: "text",
        headers: {
          "User-Agent": v.ua,
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Sec-CH-UA": v.secChUa,
          "Sec-CH-UA-Mobile": "?0",
          "Sec-CH-UA-Platform": v.platform,
          Referer: `${ORIGIN}/kr/ko/`,
        },
        throwHttpErrors: false,
        retry: { limit: 0 },
        timeout: { request: 30_000 },
      });
      const isBlocked =
        [403, 429, 503].includes(r.statusCode) || challenged(r.body);
      if (isBlocked) blocked++;
      else clean++;
      process.stdout.write(isBlocked ? "x" : ".");
    }
    console.log(
      `\n  ${v.label}: ${clean}/${N} clean, ${blocked}/${N} challenged\n`,
    );
  }
}

main().catch((err) => {
  console.error("AB FAILED:", err);
  process.exit(1);
});
