import type { RawResponse } from "../brands/BrandAdapter.js";
import type { Fetcher, Proxy } from "./Fetcher.js";
import { buildProxyAuth } from "./proxy.js";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/** Akamai challenge markers found in blocked response bodies */
const AKAMAI_BLOCK_MARKERS = ["_abck", "bm-verify", "Reference #"];

/** Random jitter between min/max ms (inclusive) */
function jitter(minMs: number, maxMs: number): Promise<void> {
  const ms = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Detect if response body contains Akamai challenge/block page */
export function isAkamaiBlocked(body: string): boolean {
  return AKAMAI_BLOCK_MARKERS.some((marker) => body.includes(marker));
}

export class HttpFetcher implements Fetcher {
  async get(
    url: string,
    opts: { proxy?: Proxy; headers?: Record<string, string> },
  ): Promise<RawResponse> {
    const { gotScraping } = await import("got-scraping");

    // Proxy is optional. With one, route through it (Hermès KR / IP-level
    // blocks); without, fetch directly — got-scraping's Chrome TLS fingerprint
    // alone clears fingerprint-level Akamai (Cartier KR).
    let proxyUrl: string | undefined;
    if (opts.proxy) {
      const auth = buildProxyAuth(opts.proxy);
      proxyUrl = `http://${auth.username}:${auth.password}@${opts.proxy.host}:${opts.proxy.port}`;
    }

    // Think-time jitter: 800–2500ms before request
    await jitter(800, 2500);

    const response = await gotScraping({
      url,
      ...(proxyUrl ? { proxyUrl } : {}),
      responseType: "text",
      headerGeneratorOptions: {
        browsers: [{ name: "chrome", minVersion: 131 }],
        operatingSystems: ["macos"],
        locales: ["ko-KR"],
      },
      headers: {
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        Referer: "https://www.hermes.com/kr/ko/",
        "User-Agent": USER_AGENT,
        "Sec-CH-UA":
          '"Chromium";v="131", "Google Chrome";v="131", "Not_A Brand";v="24"',
        "Sec-CH-UA-Mobile": "?0",
        "Sec-CH-UA-Platform": '"macOS"',
        ...opts.headers,
      },
      timeout: { request: 30_000 },
      throwHttpErrors: false,
      retry: { limit: 0 },
    });

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(response.headers)) {
      if (typeof value === "string") {
        headers[key] = value;
      } else if (Array.isArray(value)) {
        headers[key] = value.join(", ");
      }
    }

    return {
      status: response.statusCode,
      body: response.body as string,
      headers,
    };
  }
}
