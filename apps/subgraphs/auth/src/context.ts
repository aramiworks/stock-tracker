import type { AuthTrpcClient } from "./clients/trpc.js";

export interface SubgraphContext {
  "x-user-id"?: string;
  "x-user-role"?: string;
  "x-request-id"?: string;
  authorization?: string;
  userId?: string;
  userRole?: string;
  authTrpc: AuthTrpcClient;
}
