import type { RawResponse } from "../brands/BrandAdapter.js";
import type { Proxy } from "./Fetcher.js";

/**
 * Shared Oxylabs sticky-session fingerprint for hermes.com/kr.
 *
 * The INF-1507 spike proved DataDome blocks are bound to (exit IP, time), not to
 * URLs — a fresh Oxylabs KR sticky exit IP clears the block for free. The most
 * reliable clean GET is Windows Chrome 143 on a fresh sticky session.
 *
 * Both HermesFetcher (the free IP-rotation path) and CapSolverDatadomeFetcher
 * (the paid solve path) import this single fingerprint so the fetch UA and the
 * CapSolver solve UA can never drift — DataDome binds its cookie to BOTH the
 * exit IP and the UA, so a mismatch breaks the solve.
 */

/** Windows Chrome 143 — the one UA CapSolver's DataDome solver accepts AND the
 * fingerprint that scored cleanest against hermes.com/kr in the spike. */
export const HERMES_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36";

export const HERMES_BASE_HEADERS: Record<string, string> = {
  "User-Agent": HERMES_UA,
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
export function flattenHeaders(
  raw: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string") out[k] = v;
    else if (Array.isArray(v)) out[k] = v.join(", ");
  }
  return out;
}

/** Random Oxylabs sticky session id (10 chars). A new id forces a fresh exit IP. */
export function newSessionId(): string {
  return Math.random().toString(36).slice(2, 12);
}

/**
 * Oxylabs sub-user pinned to one KR exit IP for ~10 minutes.
 * `-cc-KR` targets Korea; `-sessid-{id}` pins the exit IP; `-sesstime-10` holds it.
 */
export function buildStickyUser(proxy: Proxy, sessId: string): string {
  return `${proxy.username}-cc-${proxy.countryCode}-sessid-${sessId}-sesstime-10`;
}

/** got-scraping `proxyUrl` form: http://user:pass@host:port */
export function buildStickyProxyUrl(proxy: Proxy, sessId: string): string {
  const user = buildStickyUser(proxy, sessId);
  return `http://${user}:${proxy.password}@${proxy.host}:${proxy.port}`;
}

/** CapSolver `proxy` form: http:host:port:user:pass (same sticky exit IP). */
export function buildSolverProxy(proxy: Proxy, sessId: string): string {
  const user = buildStickyUser(proxy, sessId);
  return `http:${proxy.host}:${proxy.port}:${user}:${proxy.password}`;
}

export type StickyGet = (
  url: string,
  opts: { proxy: Proxy; sessId?: string; headers?: Record<string, string> },
) => Promise<RawResponse>;

/**
 * Single GET through an Oxylabs KR sticky exit IP using the Hermès fingerprint.
 * Returns a flattened RawResponse — enough for the caller to detect a DataDome
 * interstitial and parse the page. (Cookie-carry-forward solving lives in
 * CapSolverDatadomeFetcher, which needs the raw Set-Cookie array.)
 */
export const stickyGet: StickyGet = async (url, opts) => {
  const { gotScraping } = await import("got-scraping");
  const sessId = opts.sessId ?? newSessionId();
  const proxyUrl = buildStickyProxyUrl(opts.proxy, sessId);

  const response = await gotScraping({
    url,
    proxyUrl,
    // Force HTTP/1.1. DataDome serves its challenge over HTTP/2, and got's
    // parser throws HPE_INVALID_CONSTANT before the body is readable — so the
    // interstitial is never seen and never solvable. Over h1 the challenge
    // arrives as a parseable 403 body (validated INF-1602).
    http2: false,
    responseType: "text",
    headers: { ...HERMES_BASE_HEADERS, ...opts.headers },
    throwHttpErrors: false,
    retry: { limit: 0 },
    timeout: { request: 30_000 },
  });

  return {
    status: response.statusCode,
    body: response.body as string,
    headers: flattenHeaders(response.headers),
  };
};
