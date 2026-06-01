import type { RawResponse } from "../brands/BrandAdapter.js";

export interface Proxy {
  host: string;
  port: number;
  username: string;
  password: string;
  countryCode: string; // 'KR' for now
}

export interface Fetcher {
  get(
    url: string,
    // proxy is optional: brands behind IP-level anti-bot (Hermès KR) require
    // one, but fingerprint-level brands (Cartier KR) are fetchable without it.
    // Proxy-dependent fetchers (Browser, Oxylabs WSA) throw if it is omitted.
    opts: { proxy?: Proxy; headers?: Record<string, string> },
  ): Promise<RawResponse>;
}
