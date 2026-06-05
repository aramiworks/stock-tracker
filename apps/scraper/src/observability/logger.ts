import { createLogger, type Logger } from "@stock-tracker/config";

/**
 * Singleton scraper logger. Routes to Better Stack in production when
 * `BETTER_STACK_TOKEN` is set; falls back to stdout otherwise (so dev,
 * test, and unconfigured deploys keep working without observability).
 */
let cached: Logger | undefined;

export function getScraperLogger(): Logger {
  if (!cached) {
    cached = createLogger({
      service: "scraper",
      ...(process.env["BETTER_STACK_TOKEN"]
        ? { betterStackToken: process.env["BETTER_STACK_TOKEN"] }
        : {}),
      ...(process.env["BETTER_STACK_INGEST_HOST"]
        ? { betterStackIngestHost: process.env["BETTER_STACK_INGEST_HOST"] }
        : {}),
    });
  }
  return cached;
}

/** Resets the cached logger — used by tests so env mutations take effect. */
export function resetScraperLogger(): void {
  cached = undefined;
}
