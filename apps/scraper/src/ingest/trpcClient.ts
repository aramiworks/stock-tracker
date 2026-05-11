/**
 * Stub tRPC client for calling tracker-service's ingest mutation.
 *
 * TODO(INF-1361): swap local types for tracker AppRouter import after INF-1356 merges.
 *
 * The real tRPC client will use the tracker-service's exported AppRouter type.
 * For now, we define the input/output shapes locally to match the plan contract
 * so downstream code can type-check against the expected shape.
 */

// -- Local type definitions (mirror plan contract) --

export interface DropEventUpsertInput {
  skuId: string;
  sourceUrl: string;
  detectedAt: string; // ISO 8601
  idempotencyKey: string; // sha256(skuId + windowed timestamp)
}

export interface DropEventUpsertOutput {
  dropEventId: string;
  alertsCreated: number;
}

// -- Client stub --

export function createIngestClient(): {
  tracker: {
    ingest: {
      dropEvent: {
        upsert: (input: DropEventUpsertInput) => Promise<DropEventUpsertOutput>;
      };
    };
  };
} {
  const url = process.env.TRACKER_INGEST_URL;
  const token = process.env.TRACKER_INGEST_SERVICE_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing TRACKER_INGEST_URL or TRACKER_INGEST_SERVICE_TOKEN env vars",
    );
  }

  // TODO(INF-1361): replace with actual tRPC client initialization:
  //   import { createTRPCClient, httpBatchLink } from "@trpc/client";
  //   import type { AppRouter } from "@stock-tracker/tracker-service/trpc";
  return {
    tracker: {
      ingest: {
        dropEvent: {
          upsert: async (_input: DropEventUpsertInput) => {
            throw new Error("not implemented — waiting for INF-1356 merge");
          },
        },
      },
    },
  };
}
