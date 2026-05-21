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

  it("returns grouped catalog list anonymously (catalogList)", async () => {
    const res = await execUnauth(`
      query {
        catalogList {
          brand
          productLine
          units {
            id
            brand
            productLine
            modelName
          }
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(Array.isArray(data?.catalogList)).toBe(true);
    expect(data?.catalogList.length).toBeGreaterThanOrEqual(2);

    type Group = {
      brand: string;
      productLine: string;
      units: { id: string; modelName: string; brand: string }[];
    };
    const groups = data?.catalogList as Group[];

    // Outer order: brand ASC, then productLine ASC
    const flatKeys = groups.map((g) => `${g.brand}|${g.productLine}`);
    const sortedKeys = [...flatKeys].sort();
    expect(flatKeys).toEqual(sortedKeys);

    // Each group's units sorted by modelName ASC
    for (const g of groups) {
      const names = g.units.map((u) => u.modelName);
      expect(names).toEqual([...names].sort());
      // All units in the group share its (brand, productLine)
      for (const u of g.units) {
        expect(u.brand).toBe(g.brand);
      }
    }

    // Seeded Hermes/Birkin unit appears under Hermes
    const hermesGroup = groups.find(
      (g) => g.brand === "Hermes" && g.productLine === "Birkin",
    );
    expect(hermesGroup).toBeDefined();
    expect(hermesGroup!.units.some((u) => u.id === seededUnitId)).toBe(true);
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

describe("watchlist queries + mutations (INF-1415)", () => {
  const WATCHLIST_USER_ID = "00000000-0000-0000-0000-000000000002";

  beforeAll(async () => {
    await prisma.auth_users.upsert({
      where: { id: WATCHLIST_USER_ID },
      update: {},
      create: {
        id: WATCHLIST_USER_ID,
        supabase_id: WATCHLIST_USER_ID,
        email: "watchlist-e2e@test.local",
      },
    });
  });

  afterAll(async () => {
    await prisma.watches.deleteMany({
      where: { auth_user_id: WATCHLIST_USER_ID },
    });
    await prisma.auth_users.deleteMany({
      where: { id: WATCHLIST_USER_ID },
    });
  });

  function execAs(query: string, variables?: Record<string, unknown>) {
    return executeAs({
      server,
      query,
      variables,
      trackerUrl,
      userId: WATCHLIST_USER_ID,
    });
  }

  it("happy-path: add -> list -> detail -> remove", async () => {
    // Add
    const addRes = await execAs(
      `
        mutation Add($id: ID!) {
          watchlistAdd(watchableUnitId: $id) {
            id
            watchableUnitId
            brand
            productLine
            modelName
            notifyPush
            notifyEmail
            state
            lastRestockedAt
          }
        }
      `,
      { id: seededUnitId },
    );
    const addData = getData(addRes);
    expect(addData.errors).toBeUndefined();
    expect(addData.data?.watchlistAdd.watchableUnitId).toBe(seededUnitId);
    expect(addData.data?.watchlistAdd.brand).toBe("Hermes");
    expect(addData.data?.watchlistAdd.notifyPush).toBe(true);
    expect(addData.data?.watchlistAdd.notifyEmail).toBe(true);

    // Add again -> idempotent (same id returned)
    const addAgainRes = await execAs(
      `
        mutation Add($id: ID!) {
          watchlistAdd(watchableUnitId: $id) {
            id
          }
        }
      `,
      { id: seededUnitId },
    );
    const addAgainData = getData(addAgainRes);
    expect(addAgainData.errors).toBeUndefined();
    expect(addAgainData.data?.watchlistAdd.id).toBe(
      addData.data?.watchlistAdd.id,
    );

    // List
    const listRes = await execAs(`
        query {
          watchlist {
            brand
            productLine
            entries {
              id
              watchableUnitId
              modelName
              state
              lastRestockedAt
            }
          }
        }
      `);
    const listData = getData(listRes);
    expect(listData.errors).toBeUndefined();
    expect(listData.data?.watchlist.length).toBeGreaterThanOrEqual(1);
    const hermesGroup = listData.data?.watchlist.find(
      (g: { brand: string; productLine: string }) =>
        g.brand === "Hermes" && g.productLine === "Birkin",
    );
    expect(hermesGroup).toBeDefined();
    expect(
      hermesGroup.entries.some(
        (e: { watchableUnitId: string }) => e.watchableUnitId === seededUnitId,
      ),
    ).toBe(true);

    // Detail
    const detailRes = await execAs(
      `
        query Detail($id: ID!) {
          watchlistDetail(watchableUnitId: $id) {
            entry {
              id
              watchableUnitId
              brand
              modelName
              state
            }
            skus {
              id
              color
              inStock
              lastChecked
            }
            dropEvents {
              id
              skuId
              sourceUrl
              detectedAt
            }
          }
        }
      `,
      { id: seededUnitId },
    );
    const detailData = getData(detailRes);
    expect(detailData.errors).toBeUndefined();
    expect(detailData.data?.watchlistDetail.entry.watchableUnitId).toBe(
      seededUnitId,
    );
    expect(detailData.data?.watchlistDetail.skus.length).toBeGreaterThanOrEqual(
      1,
    );
    expect(
      detailData.data?.watchlistDetail.dropEvents.some(
        (d: { id: string }) => d.id === seededDropEventId,
      ),
    ).toBe(true);

    // Remove
    const removeRes = await execAs(
      `
        mutation Remove($id: ID!) {
          watchlistRemove(watchableUnitId: $id) {
            removed
          }
        }
      `,
      { id: seededUnitId },
    );
    const removeData = getData(removeRes);
    expect(removeData.errors).toBeUndefined();
    expect(removeData.data?.watchlistRemove.removed).toBe(true);

    // Remove again -> idempotent (removed: false)
    const removeAgainRes = await execAs(
      `
        mutation Remove($id: ID!) {
          watchlistRemove(watchableUnitId: $id) {
            removed
          }
        }
      `,
      { id: seededUnitId },
    );
    const removeAgainData = getData(removeAgainRes);
    expect(removeAgainData.errors).toBeUndefined();
    expect(removeAgainData.data?.watchlistRemove.removed).toBe(false);
  });

  it("returns empty list for users with no entries", async () => {
    const res = await execAs(`
      query {
        watchlist {
          brand
          productLine
          entries {
            id
          }
        }
      }
    `);
    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.watchlist).toEqual([]);
  });

  it("rejects watchlist query without auth", async () => {
    const res = await execUnauth(`
      query {
        watchlist {
          brand
        }
      }
    `);
    const { errors } = getData(res);
    expect(errors).toBeDefined();
    expect(errors!.length).toBeGreaterThan(0);
  });

  it("rejects watchlistAdd without auth", async () => {
    const res = await execUnauth(
      `
        mutation Add($id: ID!) {
          watchlistAdd(watchableUnitId: $id) {
            id
          }
        }
      `,
      { id: seededUnitId },
    );
    const { errors } = getData(res);
    expect(errors).toBeDefined();
    expect(errors!.length).toBeGreaterThan(0);
  });
});

describe("alertHistory query (INF-1479)", () => {
  const HISTORY_USER_ID = "00000000-0000-0000-0000-000000000003";
  let historyUnitId: string;
  let historySkuId: string;

  // Three drop events with strictly-ordered timestamps so cursor pagination
  // is deterministic. Listed newest -> oldest because the query orders DESC.
  const DROP_T1 = new Date("2025-05-03T12:00:00Z"); // newest
  const DROP_T2 = new Date("2025-05-02T12:00:00Z");
  const DROP_T3 = new Date("2025-05-01T12:00:00Z"); // oldest

  let dropId1: string;
  let dropId2: string;
  let dropId3: string;

  beforeAll(async () => {
    await prisma.auth_users.upsert({
      where: { id: HISTORY_USER_ID },
      update: {},
      create: {
        id: HISTORY_USER_ID,
        supabase_id: HISTORY_USER_ID,
        email: "alert-history-e2e@test.local",
      },
    });

    // Dedicated unit + SKU so the test owns its drop event set without
    // colliding with the shared seededUnitId from the parent suite (which
    // uses a different user anyway).
    const unit = await prisma.watchable_units.create({
      data: {
        brand: "Hermes",
        product_line: "Kelly",
        model_name: "Kelly 28 (history e2e)",
        active: true,
      },
    });
    historyUnitId = unit.id;

    const sku = await prisma.skus.create({
      data: {
        watchable_unit_id: historyUnitId,
        color: "Noir",
        leather: "Togo",
        hardware: "GHW",
        size: "28",
        active: true,
      },
    });
    historySkuId = sku.id;

    // Unit-level watch (sku_id = NULL) - covers every drop event under unit.
    await prisma.watches.create({
      data: {
        auth_user_id: HISTORY_USER_ID,
        watchable_unit_id: historyUnitId,
        sku_id: null,
        notify_push: true,
        notify_email: true,
        active: true,
      },
    });

    const d1 = await prisma.drop_events.create({
      data: { sku_id: historySkuId, detected_at: DROP_T1 },
    });
    dropId1 = d1.id;
    const d2 = await prisma.drop_events.create({
      data: { sku_id: historySkuId, detected_at: DROP_T2 },
    });
    dropId2 = d2.id;
    const d3 = await prisma.drop_events.create({
      data: { sku_id: historySkuId, detected_at: DROP_T3 },
    });
    dropId3 = d3.id;
  });

  afterAll(async () => {
    await prisma.drop_events.deleteMany({ where: { sku_id: historySkuId } });
    await prisma.watches.deleteMany({
      where: { auth_user_id: HISTORY_USER_ID },
    });
    await prisma.skus.deleteMany({ where: { id: historySkuId } });
    await prisma.watchable_units.deleteMany({ where: { id: historyUnitId } });
    await prisma.auth_users.deleteMany({ where: { id: HISTORY_USER_ID } });
  });

  function execAsHistoryUser(
    query: string,
    variables?: Record<string, unknown>,
  ) {
    return executeAs({
      server,
      query,
      variables,
      trackerUrl,
      userId: HISTORY_USER_ID,
    });
  }

  it("paginates events most-recent first with cursor handoff", async () => {
    // Page 1 - limit 2 should return the two newest events and a non-null
    // cursor pointing at the boundary.
    const page1Res = await execAsHistoryUser(`
      query {
        alertHistory(limit: 2) {
          events {
            id
            brand
            productLine
            modelName
            skuDescriptor
            kind
            detectedAt
          }
          nextCursor
        }
      }
    `);
    const page1 = getData(page1Res);
    expect(page1.errors).toBeUndefined();
    expect(page1.data?.alertHistory.events).toHaveLength(2);
    expect(
      page1.data?.alertHistory.events.map((e: { id: string }) => e.id),
    ).toEqual([dropId1, dropId2]);
    expect(page1.data?.alertHistory.events[0].brand).toBe("Hermes");
    expect(page1.data?.alertHistory.events[0].productLine).toBe("Kelly");
    expect(page1.data?.alertHistory.events[0].modelName).toBe(
      "Kelly 28 (history e2e)",
    );
    expect(page1.data?.alertHistory.events[0].skuDescriptor).toBe(
      "Noir · Togo · GHW · 28",
    );
    expect(page1.data?.alertHistory.events[0].kind).toBe("restocked");
    expect(page1.data?.alertHistory.nextCursor).toBe(DROP_T2.toISOString());

    // Page 2 - using the page1 cursor, expect the oldest event and a null
    // nextCursor (final page).
    const page2Res = await execAsHistoryUser(
      `
        query ($cursor: String) {
          alertHistory(limit: 2, cursor: $cursor) {
            events {
              id
              detectedAt
            }
            nextCursor
          }
        }
      `,
      { cursor: page1.data?.alertHistory.nextCursor },
    );
    const page2 = getData(page2Res);
    expect(page2.errors).toBeUndefined();
    expect(page2.data?.alertHistory.events).toHaveLength(1);
    expect(page2.data?.alertHistory.events[0].id).toBe(dropId3);
    expect(page2.data?.alertHistory.nextCursor).toBeNull();
  });

  it("returns an empty/non-matching page for users watching different units", async () => {
    // TEST_USER_ID watches a *different* unit (seededUnitId, Hermes Birkin
    // 25), so the Kelly 28 drop events we seeded above should not appear
    // in its alertHistory.
    const res = await exec(`
      query {
        alertHistory(limit: 50) {
          events {
            id
          }
          nextCursor
        }
      }
    `);
    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    const ids = (data?.alertHistory.events as { id: string }[]).map(
      (e) => e.id,
    );
    expect(ids).not.toContain(dropId1);
    expect(ids).not.toContain(dropId2);
    expect(ids).not.toContain(dropId3);
  });

  it("rejects alertHistory query without auth", async () => {
    const res = await execUnauth(`
      query {
        alertHistory {
          events {
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
