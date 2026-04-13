/**
 * E2E test seed script — creates a known fixture set for e2e@arami.so.
 * Safe to run multiple times (upserts). Cleans existing data for the test
 * user first so flows always see a predictable state.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const E2E_SUPABASE_ID = process.env.E2E_SUPABASE_USER_ID!;
const E2E_EMAIL = process.env.E2E_USER_EMAIL ?? "e2e@arami.so";

async function main() {
  if (!E2E_SUPABASE_ID) {
    throw new Error("E2E_SUPABASE_USER_ID env var is required");
  }

  console.log(
    `Seeding E2E data for ${E2E_EMAIL} (supabase_id: ${E2E_SUPABASE_ID})`,
  );

  // Upsert auth user
  const user = await prisma.auth_users.upsert({
    where: { supabase_id: E2E_SUPABASE_ID },
    create: {
      supabase_id: E2E_SUPABASE_ID,
      email: E2E_EMAIL,
      display_name: "E2E Test User",
    },
    update: { email: E2E_EMAIL, display_name: "E2E Test User" },
  });

  // Clean existing accounts for idempotency
  await prisma.tracker_accounts.deleteMany({
    where: { auth_user_id: user.id },
  });

  // Create 2 SA accounts
  const [sa1, sa2] = await Promise.all([
    prisma.tracker_accounts.create({
      data: {
        auth_user_id: user.id,
        store_name: "까르띠에 청담",
        sa_name: "김SA",
        notes: "E2E 테스트 계좌 1",
      },
    }),
    prisma.tracker_accounts.create({
      data: {
        auth_user_id: user.id,
        store_name: "까르띠에 롯데",
        sa_name: "이SA",
        notes: "E2E 테스트 계좌 2",
      },
    }),
  ]);

  // Create purchases for SA1
  await prisma.tracker_purchases.createMany({
    data: [
      {
        tracker_account_id: sa1.id,
        item_name: "러브 브레이슬릿",
        item_category: "브레이슬릿",
        amount: 5800000,
        currency: "KRW",
        purchase_date: new Date("2025-06-15"),
        store_location: "청담",
      },
      {
        tracker_account_id: sa1.id,
        item_name: "나노 링 목걸이",
        item_category: "목걸이",
        amount: 3200000,
        currency: "KRW",
        purchase_date: new Date("2025-09-20"),
        store_location: "청담",
      },
    ],
  });

  // Create purchases for SA2
  await prisma.tracker_purchases.createMany({
    data: [
      {
        tracker_account_id: sa2.id,
        item_name: "탱크 워치",
        item_category: "시계",
        amount: 12000000,
        currency: "KRW",
        purchase_date: new Date("2025-11-01"),
        store_location: "롯데",
      },
    ],
  });

  // --- Edge-case account: max-length fields, null optionals ---
  const edgeAccount = await prisma.tracker_accounts.create({
    data: {
      auth_user_id: user.id,
      store_name: "A".repeat(255),
      sa_name: null,
      notes: null,
    },
  });

  await prisma.tracker_purchases.createMany({
    data: [
      // Boundary: minimum amount
      {
        tracker_account_id: edgeAccount.id,
        item_name: "최소 금액 테스트",
        amount: 0.01,
        currency: "USD",
        purchase_date: new Date("2025-01-01"),
        item_category: null,
        store_location: null,
        notes: null,
      },
      // Boundary: maximum amount
      {
        tracker_account_id: edgeAccount.id,
        item_name: "최대 금액 테스트",
        amount: 9999999999.99,
        currency: "KRW",
        purchase_date: new Date("2025-12-31"),
        item_category: "기타",
        store_location: null,
        notes: "N".repeat(1000),
      },
      // Different currencies
      {
        tracker_account_id: edgeAccount.id,
        item_name: "EUR purchase",
        amount: 5000,
        currency: "EUR",
        purchase_date: new Date("2025-06-15"),
        item_category: "가방",
      },
      {
        tracker_account_id: edgeAccount.id,
        item_name: "JPY purchase",
        amount: 150000,
        currency: "JPY",
        purchase_date: new Date("2025-03-10"),
        item_category: "시계",
      },
      {
        tracker_account_id: edgeAccount.id,
        item_name: "GBP purchase",
        amount: 3200,
        currency: "GBP",
        purchase_date: new Date("2025-09-22"),
        item_category: "반지",
      },
      {
        tracker_account_id: edgeAccount.id,
        item_name: "CNY purchase",
        amount: 42000,
        currency: "CNY",
        purchase_date: new Date("2025-04-05"),
        item_category: "목걸이",
      },
    ],
  });

  console.log(
    `Done. Created user ${user.id}, 3 accounts, 9 purchases (including edge cases).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
