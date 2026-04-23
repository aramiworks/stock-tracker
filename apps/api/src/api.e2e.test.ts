import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./trpc/router.js";

const prisma = new PrismaClient();
const TEST_USER_ID = "00000000-0000-0000-0000-000000000000";

const caller = appRouter.createCaller({ prisma, userId: TEST_USER_ID } as any);
const unauthCaller = appRouter.createCaller({
  prisma,
  userId: undefined,
} as any);

beforeAll(async () => {
  await prisma.auth_users.upsert({
    where: { id: TEST_USER_ID },
    update: {},
    create: {
      id: TEST_USER_ID,
      supabase_id: TEST_USER_ID,
      email: "e2e@test.local",
    },
  });
});

afterAll(async () => {
  await prisma.auth_users.deleteMany({ where: { id: TEST_USER_ID } });
  await prisma.$disconnect();
});

describe("auth E2E", () => {
  it("returns the seeded user from auth.me", async () => {
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.id).toBe(TEST_USER_ID);
    expect(result?.email).toBe("e2e@test.local");
  });
});

describe("auth enforcement E2E", () => {
  it("throws UNAUTHORIZED for auth.me without userId", async () => {
    await expect(unauthCaller.auth.me()).rejects.toThrow(TRPCError);
    try {
      await unauthCaller.auth.me();
    } catch (e) {
      expect((e as TRPCError).code).toBe("UNAUTHORIZED");
    }
  });

  it("throws UNAUTHORIZED for upsertFromSupabase without userId", async () => {
    await expect(
      unauthCaller.auth.upsertFromSupabase({ email: "public@test.local" }),
    ).rejects.toThrow(TRPCError);
  });

  it("allows upsertFromSupabase with authenticated userId", async () => {
    const result = await caller.auth.upsertFromSupabase({
      email: "updated@test.local",
    });
    expect(result.email).toBe("updated@test.local");
    expect(result.supabaseId).toBe(TEST_USER_ID);

    // Restore original email
    await caller.auth.upsertFromSupabase({ email: "e2e@test.local" });
  });
});
