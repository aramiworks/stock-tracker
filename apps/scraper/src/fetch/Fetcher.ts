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
    opts: { proxy: Proxy; headers?: Record<string, string> },
  ): Promise<RawResponse>;
}
