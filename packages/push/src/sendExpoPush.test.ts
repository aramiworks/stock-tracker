import { describe, it, expect, jest, afterEach } from "@jest/globals";
import { sendExpoPush, type ExpoMessage } from "./sendExpoPush.js";
import { buildRestockNotification } from "./buildRestockNotification.js";

const ENDPOINT = "https://example.test/push";

function msg(to: string): ExpoMessage {
  return {
    to,
    title: "재입고 알림",
    body: "Hermes Birkin 25 재입고되었습니다",
  };
}

/** Build a fake fetch whose response `data` array is the supplied tickets. */
function okFetch(tickets: unknown[]) {
  return jest.fn(async () => ({
    ok: true,
    json: async () => ({ data: tickets }),
  })) as unknown as typeof globalThis.fetch;
}

describe("sendExpoPush", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("aligns tickets back to their tokens by input order", async () => {
    const fetchImpl = okFetch([
      { status: "ok", id: "ticket-a" },
      { status: "ok", id: "ticket-b" },
    ]);

    const results = await sendExpoPush([msg("tok-a"), msg("tok-b")], {
      fetch: fetchImpl,
      endpoint: ENDPOINT,
    });

    expect(results).toEqual([
      { token: "tok-a", ok: true, id: "ticket-a" },
      { token: "tok-b", ok: true, id: "ticket-b" },
    ]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("chunks >100 messages into separate POSTs", async () => {
    const messages = Array.from({ length: 150 }, (_, i) => msg(`tok-${i}`));
    const fetchImpl = jest.fn(async (_url: unknown, init: unknown) => {
      const body = JSON.parse((init as { body: string }).body) as ExpoMessage[];
      return {
        ok: true,
        json: async () => ({
          data: body.map((_m, i) => ({ status: "ok", id: `id-${i}` })),
        }),
      };
    }) as unknown as typeof globalThis.fetch;

    const results = await sendExpoPush(messages, {
      fetch: fetchImpl,
      endpoint: ENDPOINT,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(150);
    expect(results.every((r) => r.ok)).toBe(true);
    expect(results[149]).toEqual({ token: "tok-149", ok: true, id: "id-49" });
  });

  it("maps DeviceNotRegistered from ticket details", async () => {
    const fetchImpl = okFetch([
      {
        status: "error",
        message: "...",
        details: { error: "DeviceNotRegistered" },
      },
    ]);

    const results = await sendExpoPush([msg("dead-token")], {
      fetch: fetchImpl,
      endpoint: ENDPOINT,
    });

    expect(results).toEqual([
      { token: "dead-token", ok: false, error: "DeviceNotRegistered" },
    ]);
  });

  it("falls back to ticket message when details.error is absent", async () => {
    const fetchImpl = okFetch([{ status: "error", message: "MessageTooBig" }]);

    const results = await sendExpoPush([msg("tok")], {
      fetch: fetchImpl,
      endpoint: ENDPOINT,
    });

    expect(results[0]).toEqual({
      token: "tok",
      ok: false,
      error: "MessageTooBig",
    });
  });

  it("falls back to 'unknown' when error ticket has no detail or message", async () => {
    const fetchImpl = okFetch([{ status: "error" }]);

    const results = await sendExpoPush([msg("tok")], {
      fetch: fetchImpl,
      endpoint: ENDPOINT,
    });

    expect(results[0]).toEqual({ token: "tok", ok: false, error: "unknown" });
  });

  it("marks a message NoTicket when Expo returns fewer tickets", async () => {
    const fetchImpl = okFetch([{ status: "ok", id: "only-one" }]);

    const results = await sendExpoPush([msg("tok-a"), msg("tok-b")], {
      fetch: fetchImpl,
      endpoint: ENDPOINT,
    });

    expect(results).toEqual([
      { token: "tok-a", ok: true, id: "only-one" },
      { token: "tok-b", ok: false, error: "NoTicket" },
    ]);
  });

  it("treats a non-2xx HTTP response as a chunk-wide failure", async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({}),
    })) as unknown as typeof globalThis.fetch;

    const results = await sendExpoPush([msg("tok-a"), msg("tok-b")], {
      fetch: fetchImpl,
      endpoint: ENDPOINT,
    });

    expect(results).toEqual([
      { token: "tok-a", ok: false, error: "HTTP 503" },
      { token: "tok-b", ok: false, error: "HTTP 503" },
    ]);
  });

  it("treats a thrown fetch as a chunk-wide RequestFailed", async () => {
    const fetchImpl = jest.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof globalThis.fetch;

    const results = await sendExpoPush([msg("tok")], {
      fetch: fetchImpl,
      endpoint: ENDPOINT,
    });

    expect(results[0]).toEqual({
      token: "tok",
      ok: false,
      error: "RequestFailed",
    });
  });

  it("defaults data to [] when the response omits it", async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      json: async () => ({}),
    })) as unknown as typeof globalThis.fetch;

    const results = await sendExpoPush([msg("tok")], {
      fetch: fetchImpl,
      endpoint: ENDPOINT,
    });

    expect(results[0]).toEqual({ token: "tok", ok: false, error: "NoTicket" });
  });

  it("sends an Authorization header when an accessToken is provided", async () => {
    const fetchImpl = okFetch([{ status: "ok", id: "x" }]);

    await sendExpoPush([msg("tok")], {
      fetch: fetchImpl,
      endpoint: ENDPOINT,
      accessToken: "secret-token",
    });

    const init = (fetchImpl as jest.Mock).mock.calls[0]![1] as {
      headers: Record<string, string>;
    };
    expect(init.headers["authorization"]).toBe("Bearer secret-token");
  });

  it("uses the default endpoint and global fetch when no deps are given", async () => {
    const fetchImpl = okFetch([{ status: "ok", id: "global" }]);
    globalThis.fetch = fetchImpl;

    const results = await sendExpoPush([msg("tok")]);

    expect(results[0]).toEqual({ token: "tok", ok: true, id: "global" });
    expect((fetchImpl as jest.Mock).mock.calls[0]![0]).toBe(
      "https://exp.host/--/api/v2/push/send",
    );
  });

  it("returns [] for an empty message list without calling fetch", async () => {
    const fetchImpl = okFetch([]);
    const results = await sendExpoPush([], {
      fetch: fetchImpl,
      endpoint: ENDPOINT,
    });
    expect(results).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("buildRestockNotification", () => {
  it("renders Korean title and body", () => {
    expect(
      buildRestockNotification({ brand: "Hermes", modelName: "Birkin 25" }),
    ).toEqual({
      title: "재입고 알림",
      body: "Hermes Birkin 25 재입고되었습니다",
    });
  });
});
