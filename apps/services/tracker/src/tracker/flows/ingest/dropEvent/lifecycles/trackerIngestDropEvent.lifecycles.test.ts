import {
  describe,
  expect,
  it,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";

const sendExpoPush = jest.fn();

jest.unstable_mockModule("@stock-tracker/push", () => ({
  sendExpoPush,
  buildRestockNotification: ({
    brand,
    modelName,
  }: {
    brand: string;
    modelName: string;
  }) => ({
    title: "재입고 알림",
    body: `${brand} ${modelName} 재입고되었습니다`,
  }),
}));

const { ExpoPushService } =
  await import("./trackerIngestDropEvent.lifecycles.js");
type ExpoPushServiceType =
  import("./trackerIngestDropEvent.lifecycles.js").ExpoPushService;
import type { TrackerIngestDropEventModels } from "../models/trackerIngestDropEvent.models.js";
import type { PinoLoggerService } from "@stock-tracker/nestjs-common";

const DROP_EVENT_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function createLogger() {
  return {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  } as unknown as PinoLoggerService;
}

function createModels(
  overrides: Partial<Record<keyof TrackerIngestDropEventModels, unknown>> = {},
) {
  return {
    findPendingPushAlertsForDropEvent: jest.fn(async () => []),
    markAlertsSent: jest.fn(async () => 0),
    deactivateByToken: jest.fn(async () => ({ count: 1 })),
    ...overrides,
  } as unknown as TrackerIngestDropEventModels & {
    findPendingPushAlertsForDropEvent: jest.Mock;
    markAlertsSent: jest.Mock;
    deactivateByToken: jest.Mock;
  };
}

const ALERT = {
  alertId: "alert-1",
  userId: "user-1",
  watchableUnitId: "wu-1",
  brand: "Hermes",
  productLine: "Birkin",
  modelName: "Birkin 25",
  tokens: ["tok-ok", "tok-dead"],
};

describe("ExpoPushService.dispatchForDropEvent", () => {
  let service: ExpoPushServiceType;
  let models: ReturnType<typeof createModels>;
  let logger: PinoLoggerService;

  beforeEach(() => {
    sendExpoPush.mockReset();
    models = createModels();
    logger = createLogger();
    service = new ExpoPushService(models, logger);
  });

  afterEach(() => {
    delete process.env["EXPO_ACCESS_TOKEN"];
  });

  it("no-ops when there are no pending push alerts", async () => {
    await service.dispatchForDropEvent(DROP_EVENT_ID);
    expect(sendExpoPush).not.toHaveBeenCalled();
    expect(models.markAlertsSent).not.toHaveBeenCalled();
  });

  it("no-ops when alerts have no active device tokens", async () => {
    models = createModels({
      findPendingPushAlertsForDropEvent: jest.fn(async () => [
        { ...ALERT, tokens: [] },
      ]),
    });
    service = new ExpoPushService(models, logger);

    await service.dispatchForDropEvent(DROP_EVENT_ID);

    expect(sendExpoPush).not.toHaveBeenCalled();
    expect(models.markAlertsSent).not.toHaveBeenCalled();
  });

  it("builds one message per token, stamps sent alerts, deactivates dead tokens", async () => {
    process.env["EXPO_ACCESS_TOKEN"] = "secret";
    models = createModels({
      findPendingPushAlertsForDropEvent: jest.fn(async () => [ALERT]),
    });
    service = new ExpoPushService(models, logger);
    sendExpoPush.mockResolvedValue([
      { token: "tok-ok", ok: true, id: "t1" },
      { token: "tok-dead", ok: false, error: "DeviceNotRegistered" },
    ] as never);

    await service.dispatchForDropEvent(DROP_EVENT_ID);

    const [messages, deps] = sendExpoPush.mock.calls[0]! as [
      Array<{ to: string; title: string; body: string; data: unknown }>,
      { accessToken?: string },
    ];
    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({
      to: "tok-ok",
      title: "재입고 알림",
      body: "Hermes Birkin 25 재입고되었습니다",
      data: {
        alertId: "alert-1",
        dropEventId: DROP_EVENT_ID,
        watchableUnitId: "wu-1",
        kind: "restock",
      },
    });
    expect(deps.accessToken).toBe("secret");
    expect(models.markAlertsSent).toHaveBeenCalledWith(["alert-1"]);
    expect(models.deactivateByToken).toHaveBeenCalledWith("tok-dead");
  });

  it("does not stamp an alert when every ticket failed (non-DeviceNotRegistered)", async () => {
    models = createModels({
      findPendingPushAlertsForDropEvent: jest.fn(async () => [
        { ...ALERT, tokens: ["tok-x"] },
      ]),
    });
    service = new ExpoPushService(models, logger);
    sendExpoPush.mockResolvedValue([
      { token: "tok-x", ok: false, error: "HTTP 503" },
    ] as never);

    await service.dispatchForDropEvent(DROP_EVENT_ID);

    expect(models.markAlertsSent).not.toHaveBeenCalled();
    expect(models.deactivateByToken).not.toHaveBeenCalled();
  });

  it("swallows errors and never rethrows (ingest must not fail)", async () => {
    models = createModels({
      findPendingPushAlertsForDropEvent: jest.fn(async () => {
        throw new Error("db down");
      }),
    });
    service = new ExpoPushService(models, logger);

    await expect(
      service.dispatchForDropEvent(DROP_EVENT_ID),
    ).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalled();
  });
});
