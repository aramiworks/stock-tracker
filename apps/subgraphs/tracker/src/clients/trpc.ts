import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@stock-tracker/api/trpc";

export type TrpcClient = ReturnType<typeof createTrpcClient>;

export const createTrpcClient = (
  headers: Record<string, string | undefined>,
) => {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: process.env["TRPC_SERVICE_URL"] || "http://localhost:4000",
        transformer: superjson,
        headers: () => {
          const h: Record<string, string> = {};
          if (headers["x-user-id"]) h["x-user-id"] = headers["x-user-id"];
          if (headers["x-user-role"]) h["x-user-role"] = headers["x-user-role"];
          if (headers["x-request-id"])
            h["x-request-id"] = headers["x-request-id"];
          return h;
        },
      }),
    ],
  });
};
