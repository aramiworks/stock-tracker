import { ApolloServer } from "@apollo/server";
import { PrismaClient } from "@prisma/client";
import {
  startTrpcServers,
  createTestApolloServer,
  executeAs,
} from "./helpers.js";

const prisma = new PrismaClient();
const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";

let server: ApolloServer;
let authUrl: string;
let trackerUrl: string;
let closeServers: () => Promise<void>;

let seededUnitId: string;
let seededSkuId: string;
let seededWatchId: string;
let seededDropEventId: string;
let seededAlertId: string;

beforeAll(async () => {
  const handles = await startTrpcServers();
  authUrl = handles.authUrl;
  trackerUrl = handles.trackerUrl;
  closeServers = handles.close;

  server = createTestApolloServer();
  await server.start();

  // Seed test user
  await prisma.auth_users.upsert({
    where: { id: TEST_USER_ID },
    update: {},
    create: {
      id: TEST_USER_ID,
      supabase_id: TEST_USER_ID,
      email: "subgraph-e2e@test.local",
    },
  });

  // Seed watchable unit
  const unit = await prisma.watchable_units.create({
    data: {
      brand: "Hermes",
      product_line: "Birkin",
      model_name: "Birkin 25 E2E Test",
      active: true,
    },
  });
  seededUnitId = unit.id;

  // Seed SKU
  const sku = await prisma.skus.create({
    data: {
      watchable_unit_id: seededUnitId,
      color: "Noir",
      leather: "Togo",
      active: true,
    },
  });
  seededSkuId = sku.id;

  // Seed watch for the test user
  const watch = await prisma.watches.create({
    data: {
      auth_user_id: TEST_USER_ID,
      watchable_unit_id: seededUnitId,
      notify_push: true,
      notify_email: false,
      active: true,
    },
  });
  seededWatchId = watch.id;

  // Seed drop event
  const dropEvent = await prisma.drop_events.create({
    data: {
      sku_id: seededSkuId,
      detected_at: new Date(),
    },
  });
  seededDropEventId = dropEvent.id;

  // Seed alert (unread)
  const alert = await prisma.alerts.create({
    data: {
      watch_id: seededWatchId,
      drop_event_id: seededDropEventId,
      channel: "push",
    },
  });
  seededAlertId = alert.id;
});

afterAll(async () => {
  await prisma.alerts.deleteMany({});
  await prisma.drop_events.deleteMany({});
  await prisma.watches.deleteMany({});
  await prisma.skus.deleteMany({});
  await prisma.watchable_units.deleteMany({ where: { model_name: { contains: "E2E Test" } } });
  await prisma.auth_users.deleteMany({ where: { id: TEST_USER_ID } });
  await prisma.$disconnect();
  await server.stop();
  await closeServers();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getData(res: any): any {
  if (res.body.kind !== "single") throw new Error("Expected single result");
  return res.body.singleResult;
}

function exec(
  query: string,
  variables?: Record<string, unknown>,
  userId?: string,
) {
  return executeAs({
    server,
    query,
    variables,
    authUrl,
    trackerUrl,
    userId: userId ?? TEST_USER_ID,
  });
}

function execUnauth(query: string, variables?: Record<string, unknown>) {
  return executeAs({
    server,
    query,
    variables,
    authUrl,
    trackerUrl,
    userId: undefined,
  });
}

describe("auth queries", () => {
  it("returns the seeded user from me query", async () => {
    const res = await exec(`
      query {
        me {
          id
          email
          displayName
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.me.id).toBe(TEST_USER_ID);
    expect(data?.me.email).toBe("subgraph-e2e@test.local");
  });

  it("returns error for me query without auth", async () => {
    const res = await execUnauth(`
      query {
        me {
          id
          email
        }
      }
    `);

    const { errors } = getData(res);
    expect(errors).toBeDefined();
    expect(errors!.length).toBeGreaterThan(0);
  });
});

describe("dashboard query", () => {
  it("returns dashboard summary with Hermes fields", async () => {
    const res = await exec(`
      query {
        dashboard {
          activeWatches
          unreadAlerts
          recentDrops
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.dashboard.activeWatches).toBeGreaterThanOrEqual(1);
    expect(data?.dashboard.unreadAlerts).toBeGreaterThanOrEqual(1);
    expect(data?.dashboard.recentDrops).toBeGreaterThanOrEqual(0);
  });

  it("returns error for dashboard without auth", async () => {
    const res = await execUnauth(`
      query {
        dashboard {
          activeWatches
        }
      }
    `);

    const { errors } = getData(res);
    expect(errors).toBeDefined();
    expect(errors!.length).toBeGreaterThan(0);
  });
});

describe("catalog queries", () => {
  it("returns catalog list with seeded unit", async () => {
    const res = await exec(`
      query {
        catalog {
          id
          brand
          productLine
          modelName
          active
          skus {
            id
            color
          }
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.catalog.length).toBeGreaterThanOrEqual(1);
    expect(
      data?.catalog.some((u: { id: string }) => u.id === seededUnitId),
    ).toBe(true);
    const seeded = data?.catalog.find(
      (u: { id: string }) => u.id === seededUnitId,
    );
    expect(seeded?.brand).toBe("Hermes");
    expect(seeded?.skus.length).toBeGreaterThanOrEqual(1);
  });

  it("filters catalog by productLine", async () => {
    const res = await exec(
      `
      query Catalog($productLine: String) {
        catalog(productLine: $productLine) {
          id
          productLine
        }
      }
    `,
      { productLine: "Birkin" },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(
      data?.catalog.every(
        (u: { productLine: string }) => u.productLine === "Birkin",
      ),
    ).toBe(true);
  });

  it("returns a single catalog item by id", async () => {
    const res = await exec(
      `
      query CatalogItem($id: ID!) {
        catalogItem(id: $id) {
          id
          brand
          modelName
          skus {
            id
            color
            leather
          }
        }
      }
    `,
      { id: seededUnitId },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.catalogItem.id).toBe(seededUnitId);
    expect(data?.catalogItem.modelName).toBe("Birkin 25 E2E Test");
    expect(data?.catalogItem.skus.length).toBeGreaterThanOrEqual(1);
    expect(data?.catalogItem.skus[0].color).toBe("Noir");
  });

  it("returns error for catalog without auth", async () => {
    const res = await execUnauth(`
      query {
        catalog {
          id
        }
      }
    `);

    const { errors } = getData(res);
    expect(errors).toBeDefined();
    expect(errors!.length).toBeGreaterThan(0);
  });
});

describe("watches queries", () => {
  it("returns watches list for the current user", async () => {
    const res = await exec(`
      query {
        watches {
          id
          watchableUnitId
          notifyPush
          notifyEmail
          active
          watchableUnit {
            id
            brand
            modelName
          }
          sku {
            id
          }
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.watches.length).toBeGreaterThanOrEqual(1);
    expect(
      data?.watches.some((w: { id: string }) => w.id === seededWatchId),
    ).toBe(true);
    const seeded = data?.watches.find(
      (w: { id: string }) => w.id === seededWatchId,
    );
    expect(seeded?.watchableUnit.brand).toBe("Hermes");
  });

  it("returns error for watches without auth", async () => {
    const res = await execUnauth(`
      query {
        watches {
          id
        }
      }
    `);

    const { errors } = getData(res);
    expect(errors).toBeDefined();
    expect(errors!.length).toBeGreaterThan(0);
  });
});

describe("alerts queries", () => {
  it("returns alert feed for the current user", async () => {
    const res = await exec(`
      query {
        alerts {
          items {
            id
            watchId
            channel
            sentAt
            readAt
            createdAt
            dropEvent {
              id
              skuId
              detectedAt
            }
          }
          nextCursor
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.alerts.items.length).toBeGreaterThanOrEqual(1);
    expect(
      data?.alerts.items.some((a: { id: string }) => a.id === seededAlertId),
    ).toBe(true);
  });

  it("returns unread alert count", async () => {
    const res = await exec(`
      query {
        unreadAlertCount
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.unreadAlertCount).toBeGreaterThanOrEqual(1);
  });

  it("returns error for alerts without auth", async () => {
    const res = await execUnauth(`
      query {
        alerts {
          items {
            id
          }
          nextCursor
        }
      }
    `);

    const { errors } = getData(res);
    expect(errors).toBeDefined();
    expect(errors!.length).toBeGreaterThan(0);
  });
});

describe("watch mutations", () => {
  let mutationWatchId: string;

  it("creates a watch", async () => {
    const res = await exec(
      `
      mutation CreateWatch($input: CreateWatchInput!) {
        createWatch(input: $input) {
          id
          watchableUnitId
          notifyPush
          notifyEmail
          active
        }
      }
    `,
      {
        input: {
          watchableUnitId: seededUnitId,
          skuId: seededSkuId,
          notifyPush: true,
          notifyEmail: false,
        },
      },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.createWatch.id).toBeDefined();
    expect(data?.createWatch.watchableUnitId).toBe(seededUnitId);
    mutationWatchId = data?.createWatch.id;
  });

  it("updates a watch", async () => {
    const res = await exec(
      `
      mutation UpdateWatch($input: UpdateWatchInput!) {
        updateWatch(input: $input) {
          id
          notifyEmail
          active
        }
      }
    `,
      {
        input: {
          id: mutationWatchId,
          notifyEmail: true,
        },
      },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.updateWatch.notifyEmail).toBe(true);
  });

  it("deletes a watch", async () => {
    const res = await exec(
      `
      mutation DeleteWatch($id: ID!) {
        deleteWatch(id: $id)
      }
    `,
      { id: mutationWatchId },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.deleteWatch).toBe(true);
  });
});

describe("markAlertRead mutation", () => {
  it("marks an alert as read", async () => {
    const res = await exec(
      `
      mutation MarkAlertRead($id: ID!) {
        markAlertRead(id: $id)
      }
    `,
      { id: seededAlertId },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.markAlertRead).toBe(true);
  });
});

describe("error propagation", () => {
  it("includes error info on unauthorized queries", async () => {
    const res = await execUnauth(`
      query {
        watches {
          id
        }
      }
    `);

    const { errors } = getData(res);
    expect(errors).toBeDefined();
    const error = errors![0];
    expect(error).toBeDefined();
    expect(error.message).toBeDefined();
  });
});
