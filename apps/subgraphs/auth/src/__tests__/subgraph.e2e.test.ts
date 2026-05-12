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
let closeServers: () => Promise<void>;

beforeAll(async () => {
  const handles = await startTrpcServers();
  authUrl = handles.authUrl;
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
      email: "subgraph-auth-e2e@test.local",
    },
  });
});

afterAll(async () => {
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
    userId: userId ?? TEST_USER_ID,
  });
}

function execUnauth(query: string, variables?: Record<string, unknown>) {
  return executeAs({
    server,
    query,
    variables,
    authUrl,
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
    expect(data?.me.email).toBe("subgraph-auth-e2e@test.local");
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
