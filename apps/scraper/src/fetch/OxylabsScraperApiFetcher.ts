/**
 * OxylabsScraperApiFetcher — implements the Fetcher interface using the
 * Oxylabs Web Scraper API (realtime endpoint).
 *
 * WSA handles its own egress + proxy rotation internally, so the `proxy`
 * argument from the Fetcher interface is intentionally ignored. The caller
 * still passes one (required by the interface) but it has no effect here.
 *
 * Env vars (Doppler-injected at runtime):
 *   OXYLABS_WSA_USERNAME  — Basic Auth username
 *   OXYLABS_WSA_PASSWORD  — Basic Auth password
 *   OXYLABS_WSA_ENDPOINT  — realtime endpoint URL
 *                           default: https://realtime.oxylabs.io/v1/queries
 *
 * Cost note: $2.2 / 1 000 results (Oxylabs WSA universal source, May 2026)
 */

import type { RawResponse } from "../brands/BrandAdapter.js";
import type { Fetcher, Proxy } from "./Fetcher.js";

interface WsaResult {
  content: string;
  status_code?: number;
  _response?: {
    status_code?: number;
    headers?: Record<string, string>;
  };
}

interface WsaResponse {
  results: WsaResult[];
}

export class OxylabsScraperApiFetcher implements Fetcher {
  // proxy arg is part of the Fetcher interface but unused — WSA owns its egress
  async get(
    url: string,
    _opts: { proxy?: Proxy; headers?: Record<string, string> },
  ): Promise<RawResponse> {
    const username = process.env.OXYLABS_WSA_USERNAME;
    const password = process.env.OXYLABS_WSA_PASSWORD;
    const endpoint =
      process.env.OXYLABS_WSA_ENDPOINT ??
      "https://realtime.oxylabs.io/v1/queries";

    if (!username || !password) {
      throw new Error(
        "Missing OXYLABS_WSA_USERNAME or OXYLABS_WSA_PASSWORD env vars",
      );
    }

    const credentials = Buffer.from(`${username}:${password}`).toString(
      "base64",
    );

    const body = JSON.stringify({
      source: "universal",
      url,
      geo_location: "South Korea",
      render: "html",
      user_agent_type: "desktop",
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
      signal: AbortSignal.timeout(120_000), // WSA render can take up to 60s
    });

    const json = (await response.json()) as WsaResponse;

    const result = json.results?.[0];

    if (!result) {
      return {
        status: response.status,
        body: "",
        headers: {},
      };
    }

    const htmlBody = result.content ?? "";

    // WSA returns HTTP status in result.status_code OR result._response.status_code
    const status =
      result.status_code ??
      result._response?.status_code ??
      (htmlBody.length > 0 ? 200 : 0);

    const headers: Record<string, string> = {
      ...(result._response?.headers ?? {}),
    };

    return { status, body: htmlBody, headers };
  }
}
