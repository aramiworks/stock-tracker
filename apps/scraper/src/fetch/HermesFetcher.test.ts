import { describe, expect, it, jest } from "@jest/globals";
import type { RawResponse } from "../brands/BrandAdapter.js";
import type { Fetcher, Proxy } from "./Fetcher.js";
import type { StickyGet } from "./oxylabsSticky.js";
import { HermesFetcher } from "./HermesFetcher.js";

const PROXY: Proxy = {
  host: "pr.oxylabs.io",
  port: 7777,
  username: "customer-stocktracker",
  password: "secret",
  countryCode: "KR",
};

const URL = "https://www.hermes.com/kr/ko/product/H012345/";

const clean = (body = "<html>product</html>"): RawResponse => ({
  status: 200,
  body,
  headers: {},
});

const interstitial = (): RawResponse => ({
  status: 403,
  body: "<html>var dd={'cid':'x'}</html>",
  headers: {},
});

/** Sticky GET stub returning queued responses in order (last repeats). */
function scriptedStickyGet(steps: RawResponse[]): {
  fn: StickyGet;
  sessions: string[];
} {
  const sessions: string[] = [];
  let i = 0;
  const fn: StickyGet = async (_url, opts) => {
    sessions.push(opts.sessId as string);
    const step = steps[Math.min(i, steps.length - 1)]!;
    i += 1;
    return step;
  };
  return { fn, sessions };
}

describe("HermesFetcher", () => {
  it("returns the first clean response without retrying", async () => {
    const { fn, sessions } = scriptedStickyGet([clean()]);
    const fetcher = new HermesFetcher({ proxy: PROXY, stickyGet: fn });

    const res = await fetcher.get(URL, {});

    expect(res.status).toBe(200);
    expect(sessions).toHaveLength(1);
  });

  it("rotates to a fresh sticky IP on an interstitial and returns the clean retry", async () => {
    const { fn, sessions } = scriptedStickyGet([interstitial(), clean()]);
    const fetcher = new HermesFetcher({ proxy: PROXY, stickyGet: fn });

    const res = await fetcher.get(URL, {});

    expect(res.status).toBe(200);
    expect(sessions).toHaveLength(2);
    // Each attempt uses a distinct sticky session id (fresh exit IP).
    expect(new Set(sessions).size).toBe(2);
  });

  it("exhausts maxAttempts then returns the last block when no fallback is set", async () => {
    const { fn, sessions } = scriptedStickyGet([interstitial()]);
    const fetcher = new HermesFetcher({
      proxy: PROXY,
      maxAttempts: 3,
      stickyGet: fn,
    });

    const res = await fetcher.get(URL, {});

    expect(res.status).toBe(403);
    expect(sessions).toHaveLength(3);
  });

  it("escalates to the CapSolver fallback after exhausting fresh IPs", async () => {
    const { fn } = scriptedStickyGet([interstitial()]);
    const capsolverGet = jest
      .fn<Fetcher["get"]>()
      .mockResolvedValue(clean("<html>solved</html>"));
    const capsolver: Fetcher = { get: capsolverGet };
    const fetcher = new HermesFetcher({
      proxy: PROXY,
      maxAttempts: 2,
      capsolver,
      stickyGet: fn,
    });

    const res = await fetcher.get(URL, { headers: { "X-Test": "1" } });

    expect(res.body).toContain("solved");
    expect(capsolverGet).toHaveBeenCalledTimes(1);
    const [, passedOpts] = capsolverGet.mock.calls[0]!;
    expect(passedOpts.proxy).toBe(PROXY);
    expect(passedOpts.headers).toEqual({ "X-Test": "1" });
  });

  it("does not escalate when an attempt comes back clean", async () => {
    const { fn } = scriptedStickyGet([clean()]);
    const capsolverGet = jest.fn<Fetcher["get"]>().mockResolvedValue(clean());
    const fetcher = new HermesFetcher({
      proxy: PROXY,
      capsolver: { get: capsolverGet },
      stickyGet: fn,
    });

    await fetcher.get(URL, {});

    expect(capsolverGet).not.toHaveBeenCalled();
  });
});
