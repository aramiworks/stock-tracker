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
let trackerUrl: string;
let closeServers: () => Promise<void>;

let seededUnitId: string;
let seededUnitId2: string;
let seededSkuId: string;
let seededSkuId2: string;
let seededWatchId: string;
let seededDropEventId: string;
let seededAlertId: string;

beforeAll(async () => {
  const handles = await startTrpcServers();
  trackerUrl = handles.trackerUrl;
  closeServers = handles.close;

  server = createTestApolloServer();
  await server.start();

  // Seed test user (FK requirement for watches.auth_user_id)
  await prisma.auth_users.upsert({
    where: { id: TEST_USER_ID },
    update: {},
    create: {
      id: TEST_USER_ID,
      supabase_id: TEST_USER_ID,
      email: "subgraph-tracker-e2e@test.local",
    },
  });

  // Seed watchable unit (Hermes Birkin)
  const unit = await prisma.watchable_units.create({
    data: {
      brand: "Hermes",
      product_line: "Birkin",
      model_name: "Birkin 25",
      active: true,
    },
  });
  seededUnitId = unit.id;

  // Seed second watchable unit (Chanel Classic Flap — for brand filter tests)
  const unit2 = await prisma.watchable_units.create({
    data: {
      brand: "Chanel",
      product_line: "Classic",
      model_name: "Classic Flap Medium",
      active: true,
    },
  });
  seededUnitId2 = unit2.id;

  // Seed SKU on first unit
  const sku = await prisma.skus.create({
    data: {
      watchable_unit_id: seededUnitId,
      color: "Gold",
      leather: "Togo",
      hardware: "Gold",
      size: "25",
      active: true,
    },
  });
  seededSkuId = sku.id;

  // Seed SKU on second unit
  const sku2 = await prisma.skus.create({
    data: {
      watchable_unit_id: seededUnitId2,
      color: "Black",
      leather: "Lambskin",
      hardware: "Silver",
      active: true,
    },
  });
  seededSkuId2 = sku2.id;

  // Seed a watch for the test user
  const watch = await prisma.watches.create({
    data: {
      auth_user_id: TEST_USER_ID,
      watchable_unit_id: seededUnitId,
      sku_id: seededSkuId,
      notify_push: true,
      notify_email: false,
      active: true,
    },
  });
  seededWatchId = watch.id;

  // Seed a drop event on the SKU
  const dropEvent = await prisma.drop_events.create({
    data: {
      sku_id: seededSkuId,
      source_url: "https://hermes.co.kr/test",
      detected_at: new Date(),
    },
  });
  seededDropEventId = dropEvent.id;

  // Seed an alert linked to the watch and drop event
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
  await prisma.watchable_units.deleteMany({});
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
    trackerUrl,
    userId: userId ?? TEST_USER_ID,
  });
}

function execUnauth(query: string, variables?: Record<string, unknown>) {
  return executeAs({
    server,
    query,
    variables,
    trackerUrl,
    userId: undefined,
  });
}

describe("dashboard query", () => {
  it("returns dashboard summary", async () => {
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
  it("returns paginated catalog list", async () => {
    const res = await exec(`
      query {
        catalog {
          items {
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
          nextCursor
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.catalog.items.length).toBeGreaterThanOrEqual(2);
    expect(
      data?.catalog.items.some((u: { id: string }) => u.id === seededUnitId),
    ).toBe(true);
  });

  it("returns a single catalog item by id", async () => {
    const res = await exec(
      `
      query CatalogItem($id: ID!) {
        catalogItem(id: $id) {
          id
          brand
          productLine
          modelName
          skus {
            id
            color
            leather
            hardware
          }
        }
      }
    `,
      { id: seededUnitId },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.catalogItem.id).toBe(seededUnitId);
    expect(data?.catalogItem.brand).toBe("Hermes");
    expect(data?.catalogItem.productLine).toBe("Birkin");
    expect(data?.catalogItem.modelName).toBe("Birkin 25");
    expect(data?.catalogItem.skus.length).toBeGreaterThanOrEqual(1);
  });

  it("filters catalog by brand", async () => {
    const res = await exec(
      `
      query Catalog($brand: String) {
        catalog(brand: $brand) {
          items {
            id
            brand
            modelName
          }
          nextCursor
        }
      }
    `,
      { brand: "Hermes" },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.catalog.items.length).toBeGreaterThanOrEqual(1);
    expect(
      data?.catalog.items.every((u: { brand: string }) => u.brand === "Hermes"),
    ).toBe(true);
  });

  it("filters catalog by productLine", async () => {
    const res = await exec(
      `
      query Catalog($productLine: String) {
        catalog(productLine: $productLine) {
          items {
            id
            productLine
          }
          nextCursor
        }
      }
    `,
      { productLine: "Birkin" },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(
      data?.catalog.items.every(
        (u: { productLine: string }) => u.productLine === "Birkin",
      ),
    ).toBe(true);
  });

  it("filters catalog by search (model name)", async () => {
    const res = await exec(
      `
      query Catalog($search: String) {
        catalog(search: $search) {
          items {
            id
            modelName
          }
          nextCursor
        }
      }
    `,
      { search: "Classic" },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.catalog.items.length).toBeGreaterThanOrEqual(1);
    expect(
      data?.catalog.items.every((u: { modelName: string }) =>
        u.modelName.includes("Classic"),
      ),
    ).toBe(true);
  });

  it("returns empty items when search matches nothing", async () => {
    const res = await exec(
      `
      query Catalog($search: String) {
        catalog(search: $search) {
          items {
            id
          }
          nextCursor
        }
      }
    `,
      { search: "NonExistentModel12345" },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.catalog.items).toEqual([]);
    expect(data?.catalog.nextCursor).toBeNull();
  });

  it("returns full catalog without filter params", async () => {
    const res = await exec(`
      query {
        catalog {
          items {
            id
            brand
          }
          nextCursor
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.catalog.items.length).toBeGreaterThanOrEqual(2);
  });

  it("paginates with limit and cursor", async () => {
    const firstPage = await exec(`
      query {
        catalog(limit: 1) {
          items {
            id
            brand
          }
          nextCursor
        }
      }
    `);

    const firstData = getData(firstPage);
    expect(firstData.errors).toBeUndefined();
    expect(firstData.data?.catalog.items.length).toBe(1);
    expect(firstData.data?.catalog.nextCursor).not.toBeNull();

    const secondPage = await exec(
      `
      query Catalog($cursor: ID) {
        catalog(limit: 1, cursor: $cursor) {
          items {
            id
            brand
          }
          nextCursor
        }
      }
    `,
      { cursor: firstData.data?.catalog.nextCursor },
    );

    const secondData = getData(secondPage);
    expect(secondData.errors).toBeUndefined();
    expect(secondData.data?.catalog.items.length).toBe(1);
    expect(secondData.data?.catalog.items[0].id).not.toBe(
      firstData.data?.catalog.items[0].id,
    );
  });
});

describe("watches queries", () => {
  it("returns user watches", async () => {
    const res = await exec(`
      query {
        watches {
          id
          watchableUnitId
          skuId
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
            color
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
  it("returns alert feed", async () => {
    const res = await exec(`
      query {
        alerts {
          items {
            id
            watchId
            channel
            readAt
            dropEvent {
              id
              skuId
              sourceUrl
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

  it("filters alerts with unreadOnly", async () => {
    const res = await exec(`
      query {
        alerts(unreadOnly: true) {
          items {
            id
            readAt
          }
          nextCursor
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.alerts.items).toBeDefined();
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
          skuId
          notifyPush
          notifyEmail
          active
        }
      }
    `,
      {
        input: {
          watchableUnitId: seededUnitId2,
          notifyPush: true,
          notifyEmail: true,
        },
      },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.createWatch.id).toBeDefined();
    expect(data?.createWatch.watchableUnitId).toBe(seededUnitId2);
    expect(data?.createWatch.notifyPush).toBe(true);
    expect(data?.createWatch.notifyEmail).toBe(true);
    expect(data?.createWatch.active).toBe(true);
    mutationWatchId = data?.createWatch.id;
  });

  it("updates a watch", async () => {
    const res = await exec(
      `
      mutation UpdateWatch($input: UpdateWatchInput!) {
        updateWatch(input: $input) {
          id
          notifyPush
          notifyEmail
          active
        }
      }
    `,
      {
        input: {
          id: mutationWatchId,
          notifyPush: false,
          active: false,
        },
      },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.updateWatch.notifyPush).toBe(false);
    expect(data?.updateWatch.active).toBe(false);
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
