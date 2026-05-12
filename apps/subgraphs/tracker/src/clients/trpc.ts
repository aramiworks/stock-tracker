import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { TrackerAppRouter } from "@stock-tracker/tracker-service/trpc";

export type TrackerTrpcClient = ReturnType<typeof createTrackerTrpcClient>;

function forwardHeaders(headers: Record<string, string | undefined>) {
  return () => {
    const h: Record<string, string> = {};
    if (headers["x-user-id"]) h["x-user-id"] = headers["x-user-id"];
    if (headers["x-user-role"]) h["x-user-role"] = headers["x-user-role"];
    if (headers["x-request-id"]) h["x-request-id"] = headers["x-request-id"];
    if (headers["authorization"]) h["authorization"] = headers["authorization"];
    return h;
  };
}

export const createTrackerTrpcClient = (
  headers: Record<string, string | undefined>,
) => {
  return createTRPCClient<TrackerAppRouter>({
    links: [
      httpBatchLink({
        url:
          process.env["TRPC_TRACKER_SERVICE_URL"] ||
          "http://localhost:4020/trpc",
        transformer: superjson,
        headers: forwardHeaders(headers),
      }),
    ],
  });
};
