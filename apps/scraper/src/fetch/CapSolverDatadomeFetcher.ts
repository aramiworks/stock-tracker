import type { RawResponse } from "../brands/BrandAdapter.js";
import type { Fetcher, Proxy } from "./Fetcher.js";
import {
  isDataDomeInterstitial,
  parseDd,
  buildCaptchaUrl,
  solveDatadome,
} from "./datadome.js";
import {
  HERMES_UA,
  HERMES_BASE_HEADERS,
  flattenHeaders,
  newSessionId,
  buildStickyUser,
  buildSolverProxy,
} from "./oxylabsSticky.js";

/**
 * Fetcher that loads hermes.com/kr through Oxylabs KR residential and, when
 * DataDome serves its 403 interstitial, solves it via CapSolver and retries —
 * all pinned to ONE sticky exit IP (DataDome cookies are IP-bound).
 *
 * On the clean majority of requests no solve happens (zero CapSolver cost);
 * the solve only fires on the intermittent interstitial. See
 * scripts/run-capsolver-probe.ts for the validated end-to-end.
 *
 * The UA + client hints + sticky-session builders come from oxylabsSticky.ts —
 * shared with HermesFetcher so the fetch UA and the CapSolver solve UA can never
 * drift (DataDome binds its cookie to both the exit IP AND the UA).
 */

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
    const sessId = newSessionId();
    const stickyUser = buildStickyUser(proxy, sessId);
    const proxyUrl = `http://${stickyUser}:${proxy.password}@${proxy.host}:${proxy.port}`;
    const proxyForSolver = buildSolverProxy(proxy, sessId);

    const headers = { ...HERMES_BASE_HEADERS, ...opts.headers };

    const r1 = await gotScraping({
      url,
      proxyUrl,
      // Force HTTP/1.1 so the DataDome challenge arrives as a parseable 403
      // body. Over HTTP/2 got throws HPE_INVALID_CONSTANT before the body is
      // readable, so the interstitial is never detected and never solved
      // (validated INF-1602).
      http2: false,
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
      userAgent: HERMES_UA,
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
      // Same HTTP/1.1 pin as r1 — the post-solve retry must use the identical
      // transport (and sticky exit IP) the datadome cookie was issued against.
      http2: false,
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
