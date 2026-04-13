import { ApolloServer } from "@apollo/server";
import { PrismaClient } from "@prisma/client";
import {
  startTrpcServer,
  createTestApolloServer,
  executeAs,
} from "./helpers.js";

const prisma = new PrismaClient();
const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";

let server: ApolloServer;
let trpcUrl: string;
let closeTrpc: () => Promise<void>;

let seededAccountId: string;
let seededAccountId2: string;
let seededPurchaseId: string;

beforeAll(async () => {
  const trpcHandle = await startTrpcServer();
  trpcUrl = trpcHandle.url;
  closeTrpc = trpcHandle.close;

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

  // Seed account
  const account = await prisma.tracker_accounts.create({
    data: {
      auth_user_id: TEST_USER_ID,
      store_name: "Subgraph E2E Store",
      sa_name: "Test SA",
    },
  });
  seededAccountId = account.id;

  // Seed second account for sort/search tests
  const account2 = await prisma.tracker_accounts.create({
    data: {
      auth_user_id: TEST_USER_ID,
      store_name: "Alpha Filter Store",
      sa_name: "Filter SA",
    },
  });
  seededAccountId2 = account2.id;

  // Seed purchase on first account (January 2025)
  const purchase = await prisma.tracker_purchases.create({
    data: {
      tracker_account_id: seededAccountId,
      item_name: "Subgraph E2E Ring",
      item_category: "반지",
      amount: 5000000,
      currency: "KRW",
      purchase_date: new Date("2025-01-15"),
    },
  });
  seededPurchaseId = purchase.id;

  // Seed purchase on second account (June 2025, different category)
  await prisma.tracker_purchases.create({
    data: {
      tracker_account_id: seededAccountId2,
      item_name: "Filter Test Necklace",
      item_category: "목걸이",
      amount: 8000000,
      currency: "KRW",
      purchase_date: new Date("2025-06-20"),
    },
  });
});

afterAll(async () => {
  await prisma.tracker_purchases.deleteMany({});
  await prisma.tracker_accounts.deleteMany({});
  await prisma.auth_users.deleteMany({ where: { id: TEST_USER_ID } });
  await prisma.$disconnect();
  await server.stop();
  await closeTrpc();
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
    trpcUrl,
    userId: userId ?? TEST_USER_ID,
  });
}

function execUnauth(query: string, variables?: Record<string, unknown>) {
  return executeAs({
    server,
    query,
    variables,
    trpcUrl,
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

describe("tracker queries", () => {
  it("returns dashboard summary", async () => {
    const res = await exec(`
      query {
        dashboard {
          totalAccounts
          totalPurchases
          totalSpent
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.dashboard.totalAccounts).toBeGreaterThanOrEqual(1);
    expect(data?.dashboard.totalPurchases).toBeGreaterThanOrEqual(1);
    expect(data?.dashboard.totalSpent).toBeDefined();
  });

  it("returns accounts list", async () => {
    const res = await exec(`
      query {
        accounts {
          id
          storeName
          saName
          createdAt
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.accounts.length).toBeGreaterThanOrEqual(1);
    expect(
      data?.accounts.some((a: { id: string }) => a.id === seededAccountId),
    ).toBe(true);
  });

  it("returns a single account by id", async () => {
    const res = await exec(
      `
      query Account($id: ID!) {
        account(id: $id) {
          id
          storeName
          saName
          notes
          createdAt
        }
      }
    `,
      { id: seededAccountId },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.account.id).toBe(seededAccountId);
    expect(data?.account.storeName).toBe("Subgraph E2E Store");
    expect(data?.account.saName).toBe("Test SA");
  });

  it("resolves nested purchases on account", async () => {
    const res = await exec(
      `
      query AccountWithPurchases($id: ID!) {
        account(id: $id) {
          id
          purchases {
            id
            itemName
            amount
            currency
          }
        }
      }
    `,
      { id: seededAccountId },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.account.purchases).toBeDefined();
    expect(data?.account.purchases.length).toBeGreaterThanOrEqual(1);
    expect(
      data?.account.purchases.some(
        (p: { id: string }) => p.id === seededPurchaseId,
      ),
    ).toBe(true);
  });

  it("returns purchases filtered by accountId", async () => {
    const res = await exec(
      `
      query Purchases($accountId: ID) {
        purchases(accountId: $accountId) {
          id
          itemName
          amount
          currency
          purchaseDate
        }
      }
    `,
      { accountId: seededAccountId },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.purchases).toBeDefined();
    expect(data?.purchases.length).toBeGreaterThanOrEqual(1);
  });

  it("returns error for dashboard without auth", async () => {
    const res = await execUnauth(`
      query {
        dashboard {
          totalAccounts
        }
      }
    `);

    const { errors } = getData(res);
    expect(errors).toBeDefined();
    expect(errors!.length).toBeGreaterThan(0);
  });
});

describe("mutations", () => {
  let mutationAccountId: string;
  let mutationPurchaseId: string;

  it("creates an account", async () => {
    const res = await exec(`
      mutation {
        createAccount(input: { storeName: "Mutation Test Store", saName: "Mut SA" }) {
          id
          storeName
          saName
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.createAccount.id).toBeDefined();
    expect(data?.createAccount.storeName).toBe("Mutation Test Store");
    expect(data?.createAccount.saName).toBe("Mut SA");
    mutationAccountId = data?.createAccount.id;
  });

  it("updates an account", async () => {
    const res = await exec(
      `
      mutation UpdateAccount($input: UpdateAccountInput!) {
        updateAccount(input: $input) {
          id
          storeName
          notes
        }
      }
    `,
      {
        input: {
          id: mutationAccountId,
          storeName: "Updated Mutation Store",
          notes: "updated via subgraph e2e",
        },
      },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.updateAccount.storeName).toBe("Updated Mutation Store");
    expect(data?.updateAccount.notes).toBe("updated via subgraph e2e");
  });

  it("creates a purchase", async () => {
    const res = await exec(
      `
      mutation CreatePurchase($input: CreatePurchaseInput!) {
        createPurchase(input: $input) {
          id
          itemName
          amount
          currency
          purchaseDate
        }
      }
    `,
      {
        input: {
          accountId: mutationAccountId,
          itemName: "Mutation Test Ring",
          amount: 3000000,
          currency: "KRW",
          purchaseDate: "2025-03-15",
        },
      },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.createPurchase.id).toBeDefined();
    expect(data?.createPurchase.itemName).toBe("Mutation Test Ring");
    mutationPurchaseId = data?.createPurchase.id;
  });

  it("updates a purchase", async () => {
    const res = await exec(
      `
      mutation UpdatePurchase($input: UpdatePurchaseInput!) {
        updatePurchase(input: $input) {
          id
          itemName
          amount
          notes
        }
      }
    `,
      {
        input: {
          id: mutationPurchaseId,
          itemName: "Updated Mutation Ring",
          amount: 4000000,
          notes: "updated via subgraph e2e",
        },
      },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.updatePurchase.itemName).toBe("Updated Mutation Ring");
    expect(data?.updatePurchase.notes).toBe("updated via subgraph e2e");
  });

  it("deletes a purchase", async () => {
    const res = await exec(
      `
      mutation DeletePurchase($id: ID!) {
        deletePurchase(id: $id)
      }
    `,
      { id: mutationPurchaseId },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.deletePurchase).toBe(true);
  });

  it("deletes an account", async () => {
    const res = await exec(
      `
      mutation DeleteAccount($id: ID!) {
        deleteAccount(id: $id)
      }
    `,
      { id: mutationAccountId },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.deleteAccount).toBe(true);
  });
});

describe("filtering and sorting", () => {
  it("filters purchases by dateRange", async () => {
    const res = await exec(
      `
      query Purchases($dateRange: DateRangeInput) {
        purchases(dateRange: $dateRange) {
          id
          itemName
          purchaseDate
        }
      }
    `,
      { dateRange: { from: "2025-01-01", to: "2025-01-31" } },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.purchases.length).toBeGreaterThanOrEqual(1);
    expect(
      data?.purchases.every((p: { itemName: string }) =>
        p.itemName.includes("Ring"),
      ),
    ).toBe(true);
  });

  it("filters purchases by search (store name)", async () => {
    const res = await exec(
      `
      query Purchases($search: String) {
        purchases(search: $search) {
          id
          itemName
        }
      }
    `,
      { search: "Alpha" },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.purchases.length).toBeGreaterThanOrEqual(1);
    expect(
      data?.purchases.every((p: { itemName: string }) =>
        p.itemName.includes("Necklace"),
      ),
    ).toBe(true);
  });

  it("filters purchases by itemCategory", async () => {
    const res = await exec(
      `
      query Purchases($itemCategory: String) {
        purchases(itemCategory: $itemCategory) {
          id
          itemName
        }
      }
    `,
      { itemCategory: "반지" },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.purchases.length).toBeGreaterThanOrEqual(1);
    expect(
      data?.purchases.every((p: { itemName: string }) =>
        p.itemName.includes("Ring"),
      ),
    ).toBe(true);
  });

  it("returns empty when filters match nothing", async () => {
    const res = await exec(
      `
      query Purchases($search: String) {
        purchases(search: $search) {
          id
        }
      }
    `,
      { search: "NonExistentStore12345" },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.purchases).toEqual([]);
  });

  it("sorts accounts by store_name ascending", async () => {
    const res = await exec(`
      query {
        accounts(sortBy: store_name, sortOrder: asc) {
          id
          storeName
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.accounts.length).toBeGreaterThanOrEqual(2);
    const names = data?.accounts.map((a: { storeName: string }) => a.storeName);
    expect(names).toEqual([...names].sort());
  });

  it("searches accounts by store name", async () => {
    const res = await exec(
      `
      query Accounts($search: String) {
        accounts(search: $search) {
          id
          storeName
        }
      }
    `,
      { search: "Alpha" },
    );

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.accounts.length).toBe(1);
    expect(data?.accounts[0].storeName).toBe("Alpha Filter Store");
  });

  it("returns all purchases without filter params (backward compat)", async () => {
    const res = await exec(`
      query {
        purchases {
          id
          itemName
        }
      }
    `);

    const { data, errors } = getData(res);
    expect(errors).toBeUndefined();
    expect(data?.purchases.length).toBeGreaterThanOrEqual(2);
  });
});

describe("error propagation", () => {
  it("includes error info on unauthorized queries", async () => {
    const res = await execUnauth(`
      query {
        accounts {
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
