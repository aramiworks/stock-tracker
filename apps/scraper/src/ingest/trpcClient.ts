/**
 * tRPC client for calling tracker-service's ingest mutation
 * (tracker.ingest.dropEvent.upsert, a serviceProcedure).
 *
 * Mirrors apps/subgraphs/tracker/src/clients/trpc.ts: a typed createTRPCClient
 * over httpBatchLink + superjson. Service-to-service auth is the X-Service-Token
 * header (validated against TRACKER_INGEST_SERVICE_TOKEN on the tracker side).
 *
 * The returned shape exposes `upsert(input) => Promise<output>` directly (the
 * tRPC `.mutate` is wrapped) so callers like pollCartier stay decoupled from the
 * tRPC client surface.
 */
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { TrackerAppRouter } from "@stock-tracker/tracker-service/trpc";

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

  const client = createTRPCClient<TrackerAppRouter>({
    links: [
      httpBatchLink({
        url,
        transformer: superjson,
        headers: () => ({ "x-service-token": token }),
      }),
    ],
  });

  return {
    tracker: {
      ingest: {
        dropEvent: {
          upsert: (input) =>
            client.tracker.ingest.dropEvent.upsert.mutate(input),
        },
      },
    },
  };
}
