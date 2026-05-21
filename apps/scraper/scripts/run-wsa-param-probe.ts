/**
 * WSA parameter probe for INF-1492.
 *
 * Tests 4 parameter variants on 3 Hermès KR product URLs to find a config
 * that gets past Akamai's 613/"faulted" block.  No Prisma — stdout only.
 *
 * Variants tested:
 *   v1  baseline         source=universal, render=html, user_agent_type=desktop_chrome, parse=false
 *   v2  session          same as v1 + session_id (sticky IP warm-up)
 *   v3  browser-wait     same as v1 + browser_instructions (wait_for_element + scroll)
 *   v4  web-unblocker    Oxylabs Web Unblocker proxy (unblock.oxylabs.io:60000)
 *
 * Usage:
 *   DOPPLER_PROJECT=stock-tracker DOPPLER_CONFIG=develop doppler run -- \
 *     npx tsx apps/scraper/scripts/run-wsa-param-probe.ts
 *
 * Cost:
 *   WSA:          3 URLs × 3 variants × 1 request = 9 WSA requests ≈ $0.02
 *   Web Unblocker: 3 URLs × 1 request = 3 rendered requests ≈ $0.01
 *   Total:        < $0.05
 *
 * Env vars required (Doppler develop):
 *   OXYLABS_WSA_USERNAME   — WSA Basic Auth username
 *   OXYLABS_WSA_PASSWORD   — WSA Basic Auth password
 *   OXYLABS_WSA_ENDPOINT   — optional, default: https://realtime.oxylabs.io/v1/queries
 */

const PRODUCT_URLS = [
  // Picotin Lock 18 — used in INF-1413 smoke test
  "https://www.hermes.com/kr/ko/product/picotin-lock-18-%EB%B0%B1-H056289CC37/",
  // Constance Slim Wallet
  "https://www.hermes.com/kr/ko/product/constance-slim-%EC%A7%80%EA%B0%91-H082214CK8W/",
  // Oran Sandal
  "https://www.hermes.com/kr/ko/product/oran-%EC%83%8C%EB%93%A4-H021056Zv01340/",
];

const HOMEPAGE = "https://www.hermes.com/kr/ko/";
const WSA_ENDPOINT =
  process.env.OXYLABS_WSA_ENDPOINT ?? "https://realtime.oxylabs.io/v1/queries";
const WSA_USERNAME = process.env.OXYLABS_WSA_USERNAME;
const WSA_PASSWORD = process.env.OXYLABS_WSA_PASSWORD;

// ─── Types ──────────────────────────────────────────────────────────────────

interface WsaPayload {
  source: string;
  url: string;
  geo_location: string;
  render?: string;
  parse?: boolean;
  user_agent_type?: string;
  session_id?: string;
  browser_instructions?: unknown[];
}

interface ProbeResult {
  variant: string;
  url: string;
  wsaStatus: number | null; // HTTP status returned by the target (inside WSA result)
  httpStatus: number; // HTTP status of the WSA API call itself
  contentLength: number;
  latencyMs: number;
  blocked: boolean;
  rawStatus613: boolean; // WSA returned its own 613 "faulted" code
  error?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function isAkamaiBlock(html: string): boolean {
  if (!html) return false;
  const lower = html.toLowerCase();
  return (
    lower.includes("_abck") ||
    lower.includes("ak_bmsc") ||
    lower.includes("akamai") ||
    lower.includes("access denied") ||
    lower.includes("403 forbidden") ||
    (lower.includes("bot") && lower.includes("detected"))
  );
}

async function wsaFetch(
  url: string,
  payload: WsaPayload,
): Promise<ProbeResult & { variant: string }> {
  const credentials = Buffer.from(`${WSA_USERNAME}:${WSA_PASSWORD}`).toString(
    "base64",
  );
  const start = Date.now();

  try {
    const res = await fetch(WSA_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(120_000),
    });

    const latencyMs = Date.now() - start;
    const json = (await res.json()) as {
      results?: { content?: string; status_code?: number }[];
      // WSA sometimes returns an error at the top level
      message?: string;
    };

    const result = json.results?.[0];
    const htmlBody = result?.content ?? "";
    const wsaStatus = result?.status_code ?? (htmlBody.length > 0 ? 200 : null);
    const blocked =
      wsaStatus === 403 ||
      wsaStatus === 429 ||
      wsaStatus === 503 ||
      isAkamaiBlock(htmlBody);
    const rawStatus613 = res.status === 613 || json.message?.includes("613");

    return {
      variant: payload.source, // overridden by caller
      url,
      wsaStatus,
      httpStatus: res.status,
      contentLength: htmlBody.length,
      latencyMs,
      blocked,
      rawStatus613,
    };
  } catch (err) {
    return {
      variant: "",
      url,
      wsaStatus: null,
      httpStatus: 0,
      contentLength: 0,
      latencyMs: Date.now() - start,
      blocked: false,
      rawStatus613: false,
      error: err instanceof Error ? err.message.slice(0, 200) : String(err),
    };
  }
}

async function unblockFetch(url: string): Promise<ProbeResult> {
  const start = Date.now();

  try {
    const proxyUrl = `https://${WSA_USERNAME}:${WSA_PASSWORD}@unblock.oxylabs.io:60000`;

    // Node 18+ fetch doesn't support HTTPS proxies natively — use undici's ProxyAgent
    const { ProxyAgent, fetch: undiciFetch } = await import("undici");
    const dispatcher = new ProxyAgent({
      uri: proxyUrl,
      proxyTls: { rejectUnauthorized: false },
      requestTls: { rejectUnauthorized: false },
    });

    const res = await undiciFetch(url, {
      dispatcher,
      headers: {
        "x-oxylabs-geo-location": "South Korea",
        "x-oxylabs-render": "html",
      },
    } as Parameters<typeof undiciFetch>[1]);

    const latencyMs = Date.now() - start;
    const htmlBody = await res.text();
    const wsaStatus = res.status;
    const blocked =
      wsaStatus === 403 ||
      wsaStatus === 429 ||
      wsaStatus === 503 ||
      isAkamaiBlock(htmlBody);

    return {
      variant: "v4-web-unblocker",
      url,
      wsaStatus,
      httpStatus: res.status,
      contentLength: htmlBody.length,
      latencyMs,
      blocked,
      rawStatus613: false,
    };
  } catch (err) {
    const isUndiciMissing =
      err instanceof Error && err.message.includes("Cannot find package");
    return {
      variant: "v4-web-unblocker",
      url,
      wsaStatus: null,
      httpStatus: 0,
      contentLength: 0,
      latencyMs: Date.now() - start,
      blocked: false,
      rawStatus613: false,
      error: isUndiciMissing
        ? "undici not available — skip; WSA variants above are the signal"
        : err instanceof Error
          ? err.message.slice(0, 200)
          : String(err),
    };
  }
}

function tag(r: ProbeResult): string {
  if (r.error) return `ERROR: ${r.error.slice(0, 80)}`;
  if (r.rawStatus613) return "FAULTED (613)";
  if (r.blocked) return `BLOCKED (target ${r.wsaStatus})`;
  if (!r.wsaStatus || r.wsaStatus < 200 || r.wsaStatus >= 400)
    return `FAIL (target ${r.wsaStatus ?? "??"}, api ${r.httpStatus})`;
  return `OK (${r.wsaStatus}, ${(r.contentLength / 1024).toFixed(0)}KB)`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

if (!WSA_USERNAME || !WSA_PASSWORD) {
  console.error(
    "Missing OXYLABS_WSA_USERNAME / OXYLABS_WSA_PASSWORD — run via doppler",
  );
  process.exit(1);
}

const ALL_URLS = [HOMEPAGE, ...PRODUCT_URLS];
const results: ProbeResult[] = [];

const variants: Array<{ name: string; payload: (url: string) => WsaPayload }> =
  [
    {
      name: "v1-render-chrome",
      payload: (url) => ({
        source: "universal",
        url,
        geo_location: "South Korea",
        render: "html",
        user_agent_type: "desktop_chrome",
        parse: false,
      }),
    },
    {
      name: "v2-session",
      payload: (url) => ({
        source: "universal",
        url,
        geo_location: "South Korea",
        render: "html",
        user_agent_type: "desktop_chrome",
        parse: false,
        // Warm up a sticky session — reuse the same IP across all URLs in this variant
        session_id: "probe-kr-1",
      }),
    },
    {
      name: "v3-browser-wait",
      payload: (url) => ({
        source: "universal",
        url,
        geo_location: "South Korea",
        render: "html",
        user_agent_type: "desktop_chrome",
        parse: false,
        // Wait for product content to load, then scroll to trigger lazy hydration
        browser_instructions: [
          {
            type: "wait_for_element",
            selector: { type: "css", value: "body" },
            timeout_s: 15,
          },
          { type: "scroll", x: 0, y: 500 },
          { type: "wait", wait_time_s: 2 },
        ],
      }),
    },
  ];

console.log("=== WSA Parameter Probe (INF-1492) ===");
console.log(`Endpoint: ${WSA_ENDPOINT}`);
console.log(
  `URLs: ${ALL_URLS.length} (1 homepage + ${PRODUCT_URLS.length} product pages)`,
);
console.log(`WSA variants: ${variants.length} + Web Unblocker`);
console.log("");

for (const variant of variants) {
  console.log(`\n--- ${variant.name} ---`);

  for (const url of ALL_URLS) {
    const shortUrl =
      url.replace("https://www.hermes.com/kr/ko/", "") || "(homepage)";
    const r = await wsaFetch(url, variant.payload(url));
    r.variant = variant.name;
    results.push(r);
    console.log(`  ${shortUrl} → ${tag(r)} [${r.latencyMs}ms]`);
  }
}

// v4: Web Unblocker (proxy-style, different product)
console.log("\n--- v4-web-unblocker ---");
for (const url of ALL_URLS) {
  const shortUrl =
    url.replace("https://www.hermes.com/kr/ko/", "") || "(homepage)";
  const r = await unblockFetch(url);
  results.push(r);
  console.log(`  ${shortUrl} → ${tag(r)} [${r.latencyMs}ms]`);
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log("\n\n========================================");
console.log("PROBE SUMMARY");
console.log("========================================\n");

const variantNames = [...variants.map((v) => v.name), "v4-web-unblocker"];

for (const vName of variantNames) {
  const vResults = results.filter((r) => r.variant === vName);
  const productResults = vResults.filter((r) => r.url !== HOMEPAGE);

  const productSuccess = productResults.filter(
    (r) =>
      !r.error &&
      !r.blocked &&
      !r.rawStatus613 &&
      r.wsaStatus &&
      r.wsaStatus >= 200 &&
      r.wsaStatus < 400,
  ).length;

  const homepageResult = vResults.find((r) => r.url === HOMEPAGE);
  const homepageTag = homepageResult ? tag(homepageResult) : "N/A";

  console.log(`${vName}:`);
  console.log(`  homepage:       ${homepageTag}`);
  console.log(
    `  product pages:  ${productSuccess}/${productResults.length} success`,
  );
  console.log("");
}

console.log("COPY THIS INTO fetcher-bake-test.md → WSA param probe section");
