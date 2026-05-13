import { PrismaClient } from "@stock-tracker/prisma";
import type { RawResponse } from "../../brands/BrandAdapter.js";
import { isAkamaiBlocked } from "../../fetch/HttpFetcher.js";

export interface BakeResult {
  fetcher: "http" | "browser";
  url: string;
  status: number;
  latencyMs: number;
  success: boolean;
  blocked: boolean;
  errorMsg: string | null;
  contentLength: number;
  runId: string;
}

const AKAMAI_STATUS_CODES = new Set([403, 429, 503]);

export function buildBakeResult(opts: {
  fetcher: "http" | "browser";
  url: string;
  runId: string;
  response?: RawResponse;
  latencyMs: number;
  error?: Error;
}): BakeResult {
  if (opts.error) {
    return {
      fetcher: opts.fetcher,
      url: opts.url,
      status: 0,
      latencyMs: opts.latencyMs,
      success: false,
      blocked: false,
      errorMsg: opts.error.message.slice(0, 500),
      contentLength: 0,
      runId: opts.runId,
    };
  }

  const resp = opts.response!;
  const blocked =
    AKAMAI_STATUS_CODES.has(resp.status) || isAkamaiBlocked(resp.body);
  const success = resp.status >= 200 && resp.status < 400 && !blocked;

  return {
    fetcher: opts.fetcher,
    url: opts.url,
    status: resp.status,
    latencyMs: opts.latencyMs,
    success,
    blocked,
    errorMsg: blocked ? "Akamai challenge/block detected" : null,
    contentLength: Buffer.byteLength(resp.body, "utf-8"),
    runId: opts.runId,
  };
}

export async function recordResult(
  prisma: PrismaClient,
  result: BakeResult,
): Promise<void> {
  await prisma.fetcher_bake_results.create({
    data: {
      fetcher: result.fetcher,
      url: result.url,
      status: result.status,
      latency_ms: result.latencyMs,
      success: result.success,
      blocked: result.blocked,
      error_msg: result.errorMsg,
      content_length: result.contentLength,
      run_id: result.runId,
    },
  });
}
