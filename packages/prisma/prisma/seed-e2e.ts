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

  // Clean existing watchlist data for the E2E user (cascade deletes alerts)
  await prisma.watches.deleteMany({
    where: { auth_user_id: user.supabase_id },
  });

  // Ensure catalog entries exist (upsert by unique constraint)
  const birkin25 = await prisma.watchable_units.upsert({
    where: { brand_model_name: { brand: "Hermes", model_name: "Birkin 25" } },
    create: {
      brand: "Hermes",
      product_line: "Birkin",
      model_name: "Birkin 25",
    },
    update: {},
  });

  const kelly28 = await prisma.watchable_units.upsert({
    where: {
      brand_model_name: { brand: "Hermes", model_name: "Kelly 28 Sellier" },
    },
    create: {
      brand: "Hermes",
      product_line: "Kelly",
      model_name: "Kelly 28 Sellier",
    },
    update: {},
  });

  // SKUs — upsert by reference_code (set a stable code for e2e fixtures)
  const birkin25NoirTogo = await prisma.skus.upsert({
    where: { reference_code: "E2E-B25-NOIR-TOGO-GHW" },
    create: {
      watchable_unit_id: birkin25.id,
      color: "Noir",
      leather: "Togo",
      hardware: "GHW",
      size: "25",
      reference_code: "E2E-B25-NOIR-TOGO-GHW",
    },
    update: {},
  });

  const kelly28NoirEpsom = await prisma.skus.upsert({
    where: { reference_code: "E2E-K28-NOIR-EPSOM-GHW" },
    create: {
      watchable_unit_id: kelly28.id,
      color: "Noir",
      leather: "Epsom",
      hardware: "GHW",
      size: "28",
      reference_code: "E2E-K28-NOIR-EPSOM-GHW",
    },
    update: {},
  });

  // Drop events — create fresh each run (idempotent via watches cleanup above)
  const drop1 = await prisma.drop_events.create({
    data: {
      sku_id: birkin25NoirTogo.id,
      source_url: "https://www.hermes.com/kr/ko/",
      detected_at: new Date("2026-04-20T09:15:00Z"),
      expired_at: new Date("2026-04-20T11:00:00Z"),
    },
  });

  const drop2 = await prisma.drop_events.create({
    data: {
      sku_id: kelly28NoirEpsom.id,
      source_url: "https://www.hermes.com/kr/ko/",
      detected_at: new Date("2026-05-01T10:00:00Z"),
      // Not expired — live drop
    },
  });

  // Watches: 1 per SKU, 1 unit-level (no sku_id)
  const watch1 = await prisma.watches.create({
    data: {
      auth_user_id: user.supabase_id,
      watchable_unit_id: birkin25.id,
      sku_id: birkin25NoirTogo.id,
      notify_push: true,
      notify_email: false,
    },
  });

  const watch2 = await prisma.watches.create({
    data: {
      auth_user_id: user.supabase_id,
      watchable_unit_id: kelly28.id,
      sku_id: kelly28NoirEpsom.id,
      notify_push: true,
      notify_email: true,
    },
  });

  // Unit-level watch (any SKU of Birkin 25)
  await prisma.watches.create({
    data: {
      auth_user_id: user.supabase_id,
      watchable_unit_id: birkin25.id,
      sku_id: null,
      notify_push: true,
      notify_email: false,
    },
  });

  // Alerts: past notification for watch1, unread for watch2
  await prisma.alerts.createMany({
    data: [
      {
        watch_id: watch1.id,
        drop_event_id: drop1.id,
        channel: "push",
        sent_at: new Date("2026-04-20T09:15:05Z"),
        read_at: new Date("2026-04-20T09:30:00Z"),
      },
      {
        watch_id: watch2.id,
        drop_event_id: drop2.id,
        channel: "push",
        sent_at: new Date("2026-05-01T10:00:04Z"),
        read_at: null,
      },
      {
        watch_id: watch2.id,
        drop_event_id: drop2.id,
        channel: "email",
        sent_at: new Date("2026-05-01T10:00:06Z"),
        read_at: null,
      },
    ],
  });

  console.log(
    `Done. Created user ${user.supabase_id}, 2 watchable units, 2 SKUs, 3 watches, 2 drop events, 3 alerts.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
