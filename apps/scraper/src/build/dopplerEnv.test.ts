import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { fetchDopplerEnv } from "./dopplerEnv.js";

describe("fetchDopplerEnv", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns [] and does not fetch when no token is provided", async () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch");
    expect(await fetchDopplerEnv(undefined)).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("maps Doppler secrets to {name,value}[] and excludes the Doppler token vars", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          TRACKER_INGEST_SERVICE_TOKEN: "tok",
          TRACKER_INGEST_URL:
            "http://tracker-service.railway.internal:4020/trpc",
          DOPPLER_TOKEN: "dp.st.xxx",
          DOPPLER_CONFIG: "develop",
        }),
        { status: 200 },
      ),
    );

    const env = await fetchDopplerEnv("dp.st.xxx");

    expect(env).toContainEqual({
      name: "TRACKER_INGEST_SERVICE_TOKEN",
      value: "tok",
    });
    expect(env).toContainEqual({
      name: "TRACKER_INGEST_URL",
      value: "http://tracker-service.railway.internal:4020/trpc",
    });
    // Deploy-time Doppler vars must not leak into the task runtime.
    expect(env.map((e) => e.name)).not.toContain("DOPPLER_TOKEN");
    expect(env.map((e) => e.name)).not.toContain("DOPPLER_CONFIG");
  });

  it("throws on a non-OK Doppler response", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response("nope", { status: 401, statusText: "Unauthorized" }),
      );
    await expect(fetchDopplerEnv("bad-token")).rejects.toThrow(
      /Doppler env fetch failed: 401/,
    );
  });
});
