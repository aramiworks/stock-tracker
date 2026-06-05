import type { PrismaClient, Prisma } from "@stock-tracker/prisma";
import type { Logger } from "@stock-tracker/config";

export interface ParseErrorReport {
  brand: "Hermes" | "Cartier";
  skuId: string;
  sourceUrl: string;
  error: unknown;
  /** The raw fetch payload so the parser regression can be reproduced. */
  rawPayload: unknown;
}

export interface ParseErrorReporterDeps {
  prisma: PrismaClient;
  logger: Logger;
}

/**
 * Persist a parse failure to the `parse_errors` table and emit a structured
 * log line so Better Stack picks it up. Never throws — the scraper's main
 * loop must keep moving even if the reporter itself fails.
 */
export async function reportParseError(
  deps: ParseErrorReporterDeps,
  report: ParseErrorReport,
): Promise<void> {
  const errorMsg =
    report.error instanceof Error ? report.error.message : String(report.error);

  deps.logger.error(
    {
      event: "scraper.parse_error",
      brand: report.brand,
      skuId: report.skuId,
      sourceUrl: report.sourceUrl,
      errorMsg,
    },
    `parse error: ${report.brand} ${report.skuId}`,
  );

  try {
    await deps.prisma.parse_errors.create({
      data: {
        sku_id: report.skuId,
        brand: report.brand,
        source_url: report.sourceUrl,
        error_msg: errorMsg,
        raw_payload: serializePayload(report.rawPayload),
      },
    });
  } catch (persistErr) {
    deps.logger.error(
      {
        event: "scraper.parse_error_persist_failed",
        brand: report.brand,
        skuId: report.skuId,
        errorMsg:
          persistErr instanceof Error ? persistErr.message : String(persistErr),
      },
      "failed to persist parse_error row",
    );
  }
}

/**
 * Coerce arbitrary payloads to a JSON-safe value for Prisma's `Json` column.
 * Strings are wrapped so HTML/text dumps stay queryable without surprises.
 */
function serializePayload(payload: unknown): Prisma.InputJsonValue {
  if (payload === undefined) return { kind: "empty" };
  if (typeof payload === "string") return { kind: "text", body: payload };
  return payload as Prisma.InputJsonValue;
}
