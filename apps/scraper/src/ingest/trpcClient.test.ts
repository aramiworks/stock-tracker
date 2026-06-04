import { afterEach, describe, expect, it } from "@jest/globals";
import { createIngestClient } from "./trpcClient.js";

describe("createIngestClient", () => {
  const saved = {
    url: process.env.TRACKER_INGEST_URL,
    token: process.env.TRACKER_INGEST_SERVICE_TOKEN,
  };

  afterEach(() => {
    process.env.TRACKER_INGEST_URL = saved.url;
    process.env.TRACKER_INGEST_SERVICE_TOKEN = saved.token;
  });

  it("throws when the ingest env vars are missing", () => {
    delete process.env.TRACKER_INGEST_URL;
    delete process.env.TRACKER_INGEST_SERVICE_TOKEN;
    expect(() => createIngestClient()).toThrow(/TRACKER_INGEST_URL/);
  });

  it("builds a client exposing dropEvent.upsert when configured", () => {
    process.env.TRACKER_INGEST_URL = "http://localhost:4020/trpc";
    process.env.TRACKER_INGEST_SERVICE_TOKEN = "test-token";
    const client = createIngestClient();
    expect(typeof client.tracker.ingest.dropEvent.upsert).toBe("function");
  });
});
