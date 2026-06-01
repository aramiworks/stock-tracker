/**
 * CapSolver DataDome solve probe (INF-1507).
 *
 * The Akamai probe was wrong about the adversary: hermes.com/kr is behind
 * DataDome (header `x-datadome: protected`) fronted by Cloudflare, not Akamai.
 * This probe answers the real question:
 *
 *   Can CapSolver's DataDome solver hand us a `datadome` cookie that loads
 *   a Hermès KR PRODUCT page (200, real HTML) instead of the 403 interstitial?
 *
 * Flow (ALL steps pinned to ONE Oxylabs KR exit IP via a sticky session —
 * the DataDome cookie is IP-bound, so the solve IP must equal the fetch IP):
 *   1. GET product page  → 403 interstitial, parse inline `dd` challenge object
 *   2. Build the geo.captcha-delivery.com captcha URL from the dd fields
 *   3. CapSolver DatadomeSliderTask (createTask + poll getTaskResult)
 *        → returns a validated `datadome=...` cookie
 *   4. GET product page again with that cookie + same IP → check status/block
 *
 * Usage:
 *   DOPPLER_PROJECT=stock-tracker DOPPLER_CONFIG=develop doppler run -- \
 *     npx tsx apps/scraper/scripts/run-capsolver-probe.ts
 */
import { getProxyFromEnv } from "../src/fetch/proxy.js";
import { isAkamaiBlocked } from "../src/fetch/HttpFetcher.js";

const CAPSOLVER_KEY = process.env.CAPSOLVER_API_KEY;
if (!CAPSOLVER_KEY) throw new Error("Missing CAPSOLVER_API_KEY");

// A LIVE bag product (Halzan 25 Verso, ref H082660CKBD), discovered from the
// bags-and-clutches category — the curated bake-test URLs are stale and 404.
// Product pages (unlike the homepage) DO trigger the DataDome interstitial,
// so this is a true test of the bypass on the real use-case path.
const TARGET =
  "https://www.hermes.com/kr/ko/product/halzan-25-verso-%EB%B0%B1-H082660CKBD/";
// CapSolver's DataDome solver only accepts Windows Chrome 143–146 UAs, and the
// UA sent to CapSolver MUST equal the UA used on the real fetch (DataDome binds
// the cookie to UA). So every request below uses this exact UA + client hints.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36";
const ORIGIN = "https://www.hermes.com";

const BASE_HEADERS: Record<string, string> = {
  "User-Agent": UA,
  "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Sec-CH-UA":
    '"Chromium";v="143", "Google Chrome";v="143", "Not_A Brand";v="24"',
  "Sec-CH-UA-Mobile": "?0",
  "Sec-CH-UA-Platform": '"Windows"',
};

/** Minimal cookie jar: name -> value, rebuilt into a Cookie header per request. */
const jar = new Map<string, string>();

function ingestSetCookie(setCookie: string[] | undefined): void {
  if (!setCookie) return;
  for (const line of setCookie) {
    const first = line.split(";")[0]!;
    const eq = first.indexOf("=");
    if (eq === -1) continue;
    const name = first.slice(0, eq).trim();
    const value = first.slice(eq + 1).trim();
    if (name) jar.set(name, value);
  }
}

function cookieHeader(): string {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

interface DdChallenge {
  cid: string;
  hsh: string;
  t: string;
  s: number;
  e: string;
  cookie: string;
  host: string;
}

/** Parse the inline `var dd={...}` object (single-quoted) from the block body. */
function parseDd(body: string): DdChallenge | null {
  const m = body.match(/var\s+dd\s*=\s*(\{[^}]*\})/i);
  if (!m?.[1]) return null;
  // The dd literal uses single quotes — convert to valid JSON.
  const jsonish = m[1].replace(/'/g, '"');
  try {
    const obj = JSON.parse(jsonish) as Record<string, unknown>;
    return {
      cid: String(obj.cid ?? ""),
      hsh: String(obj.hsh ?? ""),
      t: String(obj.t ?? ""),
      s: Number(obj.s ?? 0),
      e: String(obj.e ?? ""),
      cookie: String(obj.cookie ?? ""),
      host: String(obj.host ?? "geo.captcha-delivery.com"),
    };
  } catch {
    return null;
  }
}

/** Build the DataDome captcha URL CapSolver needs from the dd challenge. */
function buildCaptchaUrl(dd: DdChallenge): string {
  const params = new URLSearchParams({
    initialCid: dd.cid,
    hash: dd.hsh,
    cid: dd.cookie,
    t: dd.t,
    referer: TARGET,
    s: String(dd.s),
    e: dd.e,
  });
  return `https://${dd.host}/captcha/?${params.toString()}`;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

/** CapSolver DatadomeSliderTask: createTask → poll getTaskResult → cookie. */
async function capsolverDatadome(
  captchaUrl: string,
  proxyForSolver: string,
): Promise<string> {
  const createRes = await fetch("https://api.capsolver.com/createTask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientKey: CAPSOLVER_KEY,
      task: {
        type: "DatadomeSliderTask",
        websiteURL: TARGET,
        captchaUrl,
        userAgent: UA,
        proxy: proxyForSolver,
      },
    }),
  });
  const created = (await createRes.json()) as {
    errorId?: number;
    errorCode?: string;
    errorDescription?: string;
    taskId?: string;
  };
  if (created.errorId && created.errorId !== 0) {
    throw new Error(
      `CapSolver createTask error: ${created.errorCode} — ${created.errorDescription}`,
    );
  }
  if (!created.taskId) throw new Error("CapSolver returned no taskId");
  console.log(`  taskId=${created.taskId}`);

  for (let i = 0; i < 30; i++) {
    await sleep(2000);
    const pollRes = await fetch("https://api.capsolver.com/getTaskResult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientKey: CAPSOLVER_KEY,
        taskId: created.taskId,
      }),
    });
    const poll = (await pollRes.json()) as {
      errorId?: number;
      errorCode?: string;
      errorDescription?: string;
      status?: string;
      solution?: { cookie?: string };
    };
    if (poll.errorId && poll.errorId !== 0) {
      throw new Error(
        `CapSolver getTaskResult error: ${poll.errorCode} — ${poll.errorDescription}`,
      );
    }
    if (poll.status === "ready") {
      const cookie = poll.solution?.cookie;
      if (!cookie) throw new Error("CapSolver ready but no cookie in solution");
      return cookie;
    }
    console.log(`  ...status=${poll.status ?? "processing"} (${i + 1})`);
  }
  throw new Error("CapSolver timed out after 60s");
}

/** The interstitial is the tiny `dd`/captcha-delivery block — NOT the
 * `x-datadome: protected` header (that rides on EVERY hermes response). */
function isInterstitial(body: string): boolean {
  return (
    body.includes("var dd=") ||
    body.includes("captcha-delivery.com/c.js") ||
    isAkamaiBlocked(body)
  );
}

const MAX_SESSIONS = 8;

async function main(): Promise<void> {
  const { gotScraping } = await import("got-scraping");
  const proxy = getProxyFromEnv();

  console.log(`Target: ${TARGET}`);
  console.log(`Proxy:  ${proxy.host}:${proxy.port} (cc=${proxy.countryCode})`);
  console.log(
    `DataDome challenges are intermittent — trying up to ${MAX_SESSIONS} fresh KR sessions until one is challenged, then solving it.\n`,
  );

  let cleanCount = 0;
  let challengedCount = 0;
  let solvedSuccess: boolean | null = null;

  for (let s = 1; s <= MAX_SESSIONS; s++) {
    jar.clear();
    // Fresh sticky session per attempt: pins initial GET + solve + final GET to
    // ONE Oxylabs KR exit IP (DataDome cookies are IP-bound).
    const sessId = Math.random().toString(36).slice(2, 12);
    const stickyUser = `${proxy.username}-cc-${proxy.countryCode}-sessid-${sessId}-sesstime-10`;
    const proxyUrl = `http://${stickyUser}:${proxy.password}@${proxy.host}:${proxy.port}`;
    const proxyForSolver = `http:${proxy.host}:${proxy.port}:${stickyUser}:${proxy.password}`;

    const r1 = await gotScraping({
      url: TARGET,
      proxyUrl,
      responseType: "text",
      headers: { ...BASE_HEADERS, Referer: `${ORIGIN}/kr/ko/` },
      throwHttpErrors: false,
      retry: { limit: 0 },
      timeout: { request: 30_000 },
    });
    ingestSetCookie(r1.headers["set-cookie"]);
    const dd = parseDd(r1.body);

    if (!dd && r1.statusCode >= 200 && r1.statusCode < 400) {
      cleanCount++;
      console.log(
        `session ${s} [${sessId}]: CLEAN — status=${r1.statusCode}, no challenge (body=${r1.body.length})`,
      );
      continue;
    }
    if (!dd) {
      console.log(
        `session ${s} [${sessId}]: status=${r1.statusCode}, no dd object parsed — body head:`,
      );
      console.log(r1.body.slice(0, 400));
      continue;
    }

    challengedCount++;
    console.log(
      `session ${s} [${sessId}]: CHALLENGED — status=${r1.statusCode}, dd.t=${dd.t}`,
    );
    if (dd.t === "bv") {
      console.log(
        "  dd.t=bv → IP hard-banned; solver can't help. Next session.",
      );
      continue;
    }

    // ── CapSolver solve, then re-GET with the validated cookie ──────────
    const captchaUrl = buildCaptchaUrl(dd);
    console.log("  solving via CapSolver DatadomeSliderTask...");
    const cookieStr = await capsolverDatadome(captchaUrl, proxyForSolver);
    console.log(`  solved cookie: ${cookieStr.slice(0, 50)}...`);
    ingestSetCookie([cookieStr]);

    const r2 = await gotScraping({
      url: TARGET,
      proxyUrl,
      responseType: "text",
      headers: {
        ...BASE_HEADERS,
        Cookie: cookieHeader(),
        Referer: `${ORIGIN}/kr/ko/`,
      },
      throwHttpErrors: false,
      retry: { limit: 0 },
      timeout: { request: 30_000 },
    });
    const blocked =
      [403, 429, 503].includes(r2.statusCode) || isInterstitial(r2.body);
    solvedSuccess = !blocked;
    console.log(
      `  after solve: status=${r2.statusCode}, interstitial=${isInterstitial(r2.body)}, body=${r2.body.length}, blocked=${blocked}`,
    );
    break; // one solved challenge is enough to prove the bypass
  }

  console.log("\n========================================");
  console.log(
    `sessions: ${cleanCount} clean / ${challengedCount} challenged (of ${cleanCount + challengedCount} tried)`,
  );
  if (solvedSuccess === true) {
    console.log("RESULT: SUCCESS — CapSolver solved DataDome → page loaded.");
  } else if (solvedSuccess === false) {
    console.log("RESULT: BLOCKED — solved cookie still hit a block.");
  } else {
    console.log(
      "RESULT: NO CHALLENGE — never got the interstitial; clean 200s only. Bypass not exercised this run.",
    );
  }
  console.log("========================================");
}

main().catch((err) => {
  console.error("PROBE FAILED:", err);
  process.exit(1);
});
