import type { Proxy } from "./Fetcher.js";

/**
 * Read proxy configuration from environment variables (Doppler-injected at runtime).
 * Throws if any required variable is missing.
 */
export function getProxyFromEnv(): Proxy {
  const host = process.env.PROXY_HOST;
  const port = process.env.PROXY_PORT;
  const username = process.env.PROXY_USERNAME;
  const password = process.env.PROXY_PASSWORD;
  const countryCode = process.env.PROXY_COUNTRY_CODE;

  const missing = [
    !host && "PROXY_HOST",
    !port && "PROXY_PORT",
    !username && "PROXY_USERNAME",
    !password && "PROXY_PASSWORD",
    !countryCode && "PROXY_COUNTRY_CODE",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing proxy env vars: ${missing.join(", ")}`);
  }

  return {
    host: host!,
    port: Number(port),
    username: username!,
    password: password!,
    countryCode: countryCode!,
  };
}

/**
 * Build the actual proxy auth credentials for Oxylabs.
 *
 * Oxylabs residential proxies require the country code appended to the
 * sub-user as `-cc-{COUNTRY_CODE}`. The PROXY_USERNAME env var holds
 * the BASE sub-user (e.g., `customer-stocktracker_scraper_AmaJY`).
 * This function appends the country targeting suffix.
 *
 * Example:
 *   input:  { username: "customer-stocktracker_scraper_AmaJY", countryCode: "KR", ... }
 *   output: { username: "customer-stocktracker_scraper_AmaJY-cc-KR", password: "..." }
 */
export function buildProxyAuth(proxy: Proxy): {
  username: string;
  password: string;
} {
  return {
    username: `${proxy.username}-cc-${proxy.countryCode}`,
    password: proxy.password,
  };
}
