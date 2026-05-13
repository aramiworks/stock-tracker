import type { RawResponse } from "../brands/BrandAdapter.js";
import type { Fetcher, Proxy } from "./Fetcher.js";
import { buildProxyAuth } from "./proxy.js";

export class BrowserFetcher implements Fetcher {
  async get(
    url: string,
    opts: { proxy: Proxy; headers?: Record<string, string> },
  ): Promise<RawResponse> {
    // Lazy-import to keep cold-start cost off the HTTP path
    const { chromium } = await import("playwright-extra");
    const StealthPlugin = (await import("puppeteer-extra-plugin-stealth"))
      .default;

    chromium.use(StealthPlugin());

    const auth = buildProxyAuth(opts.proxy);

    const browser = await chromium.launch({
      headless: true,
      args: ["--disable-blink-features=AutomationControlled"],
    });

    try {
      const context = await browser.newContext({
        proxy: {
          server: `http://${opts.proxy.host}:${opts.proxy.port}`,
          username: auth.username,
          password: auth.password,
        },
        viewport: { width: 1440, height: 900 },
        locale: "ko-KR",
        timezoneId: "Asia/Seoul",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        extraHTTPHeaders: {
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          Referer: "https://www.hermes.com/kr/ko/",
          ...opts.headers,
        },
      });

      try {
        const page = await context.newPage();
        const response = await page.goto(url, {
          waitUntil: "networkidle",
          timeout: 30_000,
        });

        const status = response?.status() ?? 0;
        const body = await page.content();

        const rawHeaders = (await response?.allHeaders()) ?? {};
        const headers: Record<string, string> = {};
        for (const [key, value] of Object.entries(rawHeaders)) {
          headers[key] = value;
        }

        return { status, body, headers };
      } finally {
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }
}
