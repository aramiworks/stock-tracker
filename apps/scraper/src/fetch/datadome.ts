/**
 * DataDome challenge helpers for hermes.com/kr.
 *
 * Hermès KR sits behind DataDome (header `x-datadome: protected`) fronted by
 * Cloudflare — NOT Akamai. Most requests from a clean residential KR IP load
 * fine, but DataDome intermittently serves a 403 interstitial carrying an
 * inline `dd` challenge object. CapSolver's DatadomeSliderTask solves it and
 * returns a `datadome` cookie that, reused from the SAME exit IP, loads the
 * page. These helpers parse the challenge, build the captcha URL, and call
 * CapSolver. See scripts/run-capsolver-probe.ts for the validated end-to-end.
 */

/** The DataDome block is the tiny interstitial carrying the `dd` object /
 * captcha-delivery c.js — NOT the `x-datadome: protected` header, which rides
 * on EVERY hermes response (success included). */
export function isDataDomeInterstitial(body: string): boolean {
  return body.includes("var dd=") || body.includes("captcha-delivery.com/c.js");
}

export interface DdChallenge {
  cid: string;
  hsh: string;
  /** Challenge type: 'fe' = solvable; 'bv' = IP hard-banned (change IP). */
  t: string;
  s: number;
  e: string;
  cookie: string;
  host: string;
}

/** Parse the inline `var dd={...}` object (single-quoted) from a block body. */
export function parseDd(body: string): DdChallenge | null {
  const m = body.match(/var\s+dd\s*=\s*(\{[^}]*\})/i);
  if (!m?.[1]) return null;
  try {
    const obj = JSON.parse(m[1].replace(/'/g, '"')) as Record<string, unknown>;
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

/** Build the geo.captcha-delivery.com captcha URL CapSolver needs. */
export function buildCaptchaUrl(dd: DdChallenge, pageUrl: string): string {
  const params = new URLSearchParams({
    initialCid: dd.cid,
    hash: dd.hsh,
    cid: dd.cookie,
    t: dd.t,
    referer: pageUrl,
    s: String(dd.s),
    e: dd.e,
  });
  return `https://${dd.host}/captcha/?${params.toString()}`;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

/**
 * CapSolver DatadomeSliderTask: createTask → poll getTaskResult → cookie.
 *
 * `proxy` must be the SAME exit IP used to fetch the page (DataDome binds the
 * cookie to IP). `userAgent` must be a CapSolver-supported Windows Chrome UA
 * AND must equal the UA used on the real fetch (DataDome binds to UA too).
 * Returns the `datadome=...` Set-Cookie string from the solution.
 */
export async function solveDatadome(opts: {
  clientKey: string;
  pageUrl: string;
  captchaUrl: string;
  userAgent: string;
  proxy: string;
}): Promise<string> {
  const createRes = await fetch("https://api.capsolver.com/createTask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientKey: opts.clientKey,
      task: {
        type: "DatadomeSliderTask",
        websiteURL: opts.pageUrl,
        captchaUrl: opts.captchaUrl,
        userAgent: opts.userAgent,
        proxy: opts.proxy,
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
      `CapSolver createTask: ${created.errorCode} — ${created.errorDescription}`,
    );
  }
  if (!created.taskId) throw new Error("CapSolver returned no taskId");

  for (let i = 0; i < 30; i++) {
    await sleep(2000);
    const pollRes = await fetch("https://api.capsolver.com/getTaskResult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientKey: opts.clientKey,
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
        `CapSolver getTaskResult: ${poll.errorCode} — ${poll.errorDescription}`,
      );
    }
    if (poll.status === "ready") {
      const cookie = poll.solution?.cookie;
      if (!cookie) throw new Error("CapSolver ready but no cookie in solution");
      return cookie;
    }
  }
  throw new Error("CapSolver timed out after 60s");
}
