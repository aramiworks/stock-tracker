import type { RawResponse } from "../brands/BrandAdapter.js";
import type { Fetcher, Proxy } from "./Fetcher.js";
import {
  isDataDomeInterstitial,
  parseDd,
  buildCaptchaUrl,
  solveDatadome,
} from "./datadome.js";

/**
 * Fetcher that loads hermes.com/kr through Oxylabs KR residential and, when
 * DataDome serves its 403 interstitial, solves it via CapSolver and retries —
 * all pinned to ONE sticky exit IP (DataDome cookies are IP-bound).
 *
 * On the clean majority of requests no solve happens (zero CapSolver cost);
 * the solve only fires on the intermittent interstitial. See
 * scripts/run-capsolver-probe.ts for the validated end-to-end.
 */

// CapSolver's DataDome solver only accepts Windows Chrome 143–146 UAs, and the
// UA sent to CapSolver MUST equal the UA used on the real fetch. So this
// fetcher pins one consistent UA + client hints across every request.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36";

const BASE_HEADERS: Record<string, string> = {
  "User-Agent": UA,
  "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Sec-CH-UA":
    '"Chromium";v="143", "Google Chrome";v="143", "Not_A Brand";v="24"',
  "Sec-CH-UA-Mobile": "?0",
  "Sec-CH-UA-Platform": '"Windows"',
  Referer: "https://www.hermes.com/kr/ko/",
};

/** Collapse got-scraping's header bag (string | string[]) to a flat record. */
function flattenHeaders(
  raw: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string") out[k] = v;
    else if (Array.isArray(v)) out[k] = v.join(", ");
  }
  return out;
}

export class CapSolverDatadomeFetcher implements Fetcher {
  constructor(private readonly clientKey: string) {
    if (!clientKey)
      throw new Error("CapSolverDatadomeFetcher: missing clientKey");
  }

  async get(
    url: string,
    opts: { proxy: Proxy; headers?: Record<string, string> },
  ): Promise<RawResponse> {
    const { gotScraping } = await import("got-scraping");
    const { proxy } = opts;

    // Sticky session pins the initial GET, the CapSolver solve, and the retry
    // GET to ONE Oxylabs KR exit IP (DataDome cookies are IP-bound).
    const sessId = Math.random().toString(36).slice(2, 12);
    const stickyUser = `${proxy.username}-cc-${proxy.countryCode}-sessid-${sessId}-sesstime-10`;
    const proxyUrl = `http://${stickyUser}:${proxy.password}@${proxy.host}:${proxy.port}`;
    const proxyForSolver = `http:${proxy.host}:${proxy.port}:${stickyUser}:${proxy.password}`;

    const headers = { ...BASE_HEADERS, ...opts.headers };

    const r1 = await gotScraping({
      url,
      proxyUrl,
      responseType: "text",
      headers,
      throwHttpErrors: false,
      retry: { limit: 0 },
      timeout: { request: 30_000 },
    });

    // Clean path — no interstitial, return as-is (no CapSolver cost).
    if (!isDataDomeInterstitial(r1.body)) {
      return {
        status: r1.statusCode,
        body: r1.body as string,
        headers: flattenHeaders(r1.headers),
      };
    }

    // Interstitial — try to solve.
    const dd = parseDd(r1.body);
    if (!dd || dd.t === "bv") {
      // Unparseable, or t=bv (IP hard-banned: a solve can't help). Surface the
      // block so the caller counts it as blocked.
      return {
        status: r1.statusCode,
        body: r1.body as string,
        headers: flattenHeaders(r1.headers),
      };
    }

    const captchaUrl = buildCaptchaUrl(dd, url);
    const cookieStr = await solveDatadome({
      clientKey: this.clientKey,
      pageUrl: url,
      captchaUrl,
      userAgent: UA,
      proxy: proxyForSolver,
    });
    const datadomeCookie = cookieStr.split(";")[0]!.trim();

    // Carry forward any cookies from the first response (e.g. __cf_bm).
    const priorCookies = (r1.headers["set-cookie"] ?? [])
      .map((c) => c.split(";")[0]!.trim())
      .filter((c) => !c.startsWith("datadome="));
    const cookieHeader = [...priorCookies, datadomeCookie].join("; ");

    const r2 = await gotScraping({
      url,
      proxyUrl,
      responseType: "text",
      headers: { ...headers, Cookie: cookieHeader },
      throwHttpErrors: false,
      retry: { limit: 0 },
      timeout: { request: 30_000 },
    });

    return {
      status: r2.statusCode,
      body: r2.body as string,
      headers: flattenHeaders(r2.headers),
    };
  }
}
