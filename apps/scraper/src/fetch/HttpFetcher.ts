import type { RawResponse } from "../brands/BrandAdapter.js";
import type { Fetcher, Proxy } from "./Fetcher.js";

export class HttpFetcher implements Fetcher {
  async get(
    _url: string,
    _opts: { proxy: Proxy; headers?: Record<string, string> },
  ): Promise<RawResponse> {
    throw new Error("not implemented — INF-1360 spike");
  }
}
