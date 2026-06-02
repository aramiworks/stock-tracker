import type { RawResponse } from "../brands/BrandAdapter.js";
import type { Fetcher, Proxy } from "./Fetcher.js";
import { isDataDomeInterstitial } from "./datadome.js";
import { newSessionId, stickyGet, type StickyGet } from "./oxylabsSticky.js";

/**
 * Composite Fetcher for hermes.com/kr.
 *
 * Strategy (cost-optimal, from the INF-1507 spike):
 *   1. GET through a FRESH Oxylabs KR sticky exit IP. Clean -> return (free).
 *   2. On a DataDome interstitial, rotate to a new sticky IP and retry — the
 *      block is bound to (IP, time), so a fresh IP usually clears it for free.
 *   3. After `maxAttempts` fresh IPs still blocked, escalate to CapSolver IF a
 *      fallback fetcher was injected. Escalation is OFF by default until residual
 *      block data justifies the paid solve.
 *   4. No fallback configured -> return the last blocked response; the Hermès
 *      parser raises ParseError, which pollHermes records as an error.
 *
 * Hermès needs a proxy, but BrandAdapter.fetch passes `proxy: undefined`
 * (the adapter is proxy-agnostic). So this fetcher OWNS its proxy and ignores
 * `opts.proxy`; it merges only `opts.headers`.
 */

export interface HermesFetcherDeps {
  /** Oxylabs KR residential proxy (typically from getProxyFromEnv()). */
  proxy: Proxy;
  /** Fresh-sticky-IP GET attempts before escalating. Default 3. */
  maxAttempts?: number;
  /**
   * Paid fallback (CapSolverDatadomeFetcher). When omitted, escalation is
   * disabled and persistent blocks surface as-is (free path only).
   */
  capsolver?: Fetcher;
  /** Injectable for tests; defaults to the real Oxylabs sticky GET. */
  stickyGet?: StickyGet;
}

export class HermesFetcher implements Fetcher {
  private readonly proxy: Proxy;
  private readonly maxAttempts: number;
  private readonly capsolver: Fetcher | undefined;
  private readonly stickyGetFn: StickyGet;

  constructor(deps: HermesFetcherDeps) {
    this.proxy = deps.proxy;
    this.maxAttempts = deps.maxAttempts ?? 3;
    this.capsolver = deps.capsolver;
    this.stickyGetFn = deps.stickyGet ?? stickyGet;
  }

  async get(
    url: string,
    opts: { proxy?: Proxy; headers?: Record<string, string> },
  ): Promise<RawResponse> {
    const headers = opts.headers;
    let last: RawResponse | undefined;

    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      const res = await this.stickyGetFn(url, {
        proxy: this.proxy,
        sessId: newSessionId(),
        headers,
      });
      last = res;
      if (!isDataDomeInterstitial(res.body)) return res; // clean — free path
      // Interstitial: rotate to a fresh sticky exit IP and retry (free).
    }

    // Persistent interstitial across every fresh IP this window.
    if (this.capsolver) {
      return this.capsolver.get(url, { proxy: this.proxy, headers });
    }

    // No paid fallback configured — surface the block; the parser flags it.
    return last as RawResponse;
  }
}
